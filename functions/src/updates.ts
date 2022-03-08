
// Required Packages:
const fs = require('fs');
const rpcs = require('../static/rpcs.json');

// Imports:
import { query } from './functions';
import { Address } from 'cookietrack-types';
import { BigNumber, ethers } from 'ethers';
import { beethovenx } from './ABIs';
import { vault as beethovenxVault } from './routes/fantom/beethovenx';

// Initializations:
const routesFile = 'routes.json';
const beethovenFile = 'beethovenx-pools.json';
const beethovenMaxInactiveBlocks = 30000;
const beethovenFactoryAddresses: Address[] = [
  '0x60467cb225092cE0c989361934311175f437Cf53',
  '0x92b377187bcCC6556FceD2f1e6DAd65850C20630',
  '0x55df810876354Fc3e249f701Dd78DeDE57991F8D',
  '0x2C774732c93CE393eC8125bDA49fb3737Ae6F473',
  '0x70b55Af71B29c5Ca7e67bD1995250364C4bE5554'
];
let beethovenxPools: Record<'pools', string[]> = { pools: [] };
let apiRoutes: Record<string, string[]> = {};

// Setting Up Optional Args:
let quickUpdate = false;
const args = process.argv.slice(2);
if(args.length > 0) {
  if(args[0] === 'quick') {
    quickUpdate = true;
  }
}

/* ========================================================================================================================================================================= */

// Function to update 'routes.json' file:
const updateRoutes = () => {

  // Update Alert:
  console.info('Updating Routes...');

  // Fetching Data:
  let chains: string[] = fs.readdirSync('./functions/dist/routes').filter((file: string) => file != 'template.js');
  chains.forEach(chain => {
    let endpoints = fs.readdirSync(`./functions/dist/routes/${chain}`).map((route: string) => route.slice(0, -3));
    apiRoutes[chain] = [...endpoints];
  });

  // Writing File:
  fs.writeFile(`./functions/static/${routesFile}`, JSON.stringify(apiRoutes, null, ' '), 'utf8', (err: any) => {
    if(err) {
      console.error(err);
    } else {
      console.info(`Successfully updated ${routesFile}.`);
    }
  });
}

/* ========================================================================================================================================================================= */

// Function to update 'beethovenx-pools.json' file:
const updateBeethovenxPools = async () => {

  // Update Alert:
  console.info('Updating Beethoven X Pools...');

  // Ethers Setup:
  let ftm = new ethers.providers.JsonRpcProvider(rpcs.ftm[0]);
  let ftmBackup = new ethers.providers.JsonRpcProvider(rpcs.ftm[1]);

  // Fetching Current Block:
  let currentBlock = await ftm.getBlockNumber();

  // Fetching Data:
  await fetchPoolIDsFromFactory(beethovenFactoryAddresses[0], currentBlock, ftm, ftmBackup);
  await fetchPoolIDsFromFactory(beethovenFactoryAddresses[1], currentBlock, ftm, ftmBackup);
  await fetchPoolIDsFromFactory(beethovenFactoryAddresses[2], currentBlock, ftm, ftmBackup);
  await fetchPoolIDsFromFactory(beethovenFactoryAddresses[3], currentBlock, ftm, ftmBackup);
  await fetchPoolIDsFromFactory(beethovenFactoryAddresses[4], currentBlock, ftm, ftmBackup);

  // Writing File:
  beethovenxPools.pools.sort();
  fs.writeFile(`./functions/static/${beethovenFile}`, JSON.stringify(beethovenxPools, null, ' '), 'utf8', (err: any) => {
    if(err) {
      console.error(err);
    } else {
      console.info(`Successfully updated ${beethovenFile}.`);
    }
  });
}

// Helper function to fetch pool IDs from factory addresses:
const fetchPoolIDsFromFactory = async (factory: Address, currentBlock: number, ftm: ethers.providers.JsonRpcProvider, ftmBackup: ethers.providers.JsonRpcProvider) => {

  // Initializations:
  let creationEvents;
  let batchSize = 50;
  let startBatch = 0;
  let endBatch = batchSize;

  // Events Setup:
  let factoryEvents = new ethers.Contract(factory, ['event PoolCreated(address indexed pool)'], ftm);
  let factoryEventsBackup = new ethers.Contract(factory, ['event PoolCreated(address indexed pool)'], ftmBackup);

  // Fetching Pool IDs:
  try {
    while(!creationEvents) {
      try {
        creationEvents = await factoryEvents.queryFilter(factoryEvents.filters.PoolCreated());
      } catch {
        console.warn(`Retrying Pool Creation Query: ${factory}...`);
        creationEvents = await factoryEventsBackup.queryFilter(factoryEventsBackup.filters.PoolCreated());
      }
    }
    if(creationEvents.length <= batchSize) {
      let promises = creationEvents.map(event => (async () => {
        if(event.args) {
          let address: Address = event.args[0];
          let poolID = await query('ftm', address, beethovenx.poolABI, 'getPoolId', []);
          let lastChangeBlock = (<BigNumber>(await query('ftm', beethovenxVault, beethovenx.vaultABI, 'getPoolTokens', [poolID])).lastChangeBlock).toNumber();
          if(lastChangeBlock > currentBlock - beethovenMaxInactiveBlocks) {
            beethovenxPools.pools.push(poolID);
          }
        }
      })());
      await Promise.all(promises);
    } else {
      while(endBatch < creationEvents.length + batchSize) {
        let promises = creationEvents.slice(startBatch, endBatch).map(event => (async () => {
          if(event.args) {
            let address: Address = event.args[0];
            let poolID = await query('ftm', address, beethovenx.poolABI, 'getPoolId', []);
            let lastChangeBlock = (<BigNumber>(await query('ftm', beethovenxVault, beethovenx.vaultABI, 'getPoolTokens', [poolID])).lastChangeBlock).toNumber();
            if(lastChangeBlock > currentBlock - beethovenMaxInactiveBlocks) {
              beethovenxPools.pools.push(poolID);
            }
          }
        })());
        await Promise.all(promises);
        startBatch += batchSize;
        endBatch += batchSize;
      }
    }
    console.info(`Successfully fetched pool IDs for factory: ${factory}`);
  } catch(err) {
    console.error(err);
  }
}

/* ========================================================================================================================================================================= */

// Performing quick updates when deploying:
updateRoutes();

// Other updates to run through 'npm run update':
if(!quickUpdate) {
  updateBeethovenxPools();
}