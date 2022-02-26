
// Imports:
const fs = require('fs');
const rpcs = require('../static/rpcs.json');
import { Address } from 'cookietrack-types';
import { BigNumber, ethers } from 'ethers';
import { beethovenx } from './ABIs';
import { vault as beethovenxVault } from './routes/fantom/beethovenx';

/* ========================================================================================================================================================================= */

// Initializations:
let apiRoutes: Record<string, string[]> = {};

// Function to update 'routes.json' file:
const updateRoutes = () => {

  // Fetching Data:
  let chains: string[] = fs.readdirSync('./functions/dist/routes').filter((file: string) => file != 'template.js');
  chains.forEach(chain => {
    let endpoints = fs.readdirSync(`./functions/dist/routes/${chain}`).map((route: string) => route.slice(0, -3));
    apiRoutes[chain] = [...endpoints];
  });

  // Writing File:
  fs.writeFile('./functions/static/routes.json', JSON.stringify(apiRoutes, null, ' '), 'utf8', (err: any) => {
    if(err) {
      console.error(err);
    } else {
      console.info('Successfully updated routes file.');
    }
  });
}

// Updating:
updateRoutes();

/* ========================================================================================================================================================================= */

{
  // Initializations:
  const filename = "beethovenx-pools.json";
  const maxInactiveTime = 60 * 60 * 24 * 7; // 1 week in seconds

  // Function to update 'beethovenx-pools.json' file:
  const updateBeethovenxPools = async () => {

    // Initializations:
    let beethovenxPools: Record<'pools', string[]> = { pools: [] };

    // Fetching Data:
    const factoryAddresses = [
      "0x60467cb225092cE0c989361934311175f437Cf53",
      "0x92b377187bcCC6556FceD2f1e6DAd65850C20630",
      "0x55df810876354Fc3e249f701Dd78DeDE57991F8D",
      "0x2C774732c93CE393eC8125bDA49fb3737Ae6F473",
      "0x70b55Af71B29c5Ca7e67bD1995250364C4bE5554"
    ];
    const provider = new ethers.providers.JsonRpcProvider(rpcs.ftm[0]);
    const poolPromises: Promise<void>[] = [];
    const vaultContract = new ethers.Contract(beethovenxVault, beethovenx.vaultABI, provider);
    for(const factory of factoryAddresses) {
      try {
        const factoryEvents = new ethers.Contract(factory, ["event PoolCreated(address indexed pool)"], provider);
        const creationEvents = await factoryEvents.queryFilter(factoryEvents.filters.PoolCreated());
        for(const event of creationEvents) {
          if(!event.args) throw new Error(`Missing args for event: ${event.event}`);
          const address: Address = event.args[0];

          // Check if pool is active before pushing to list
          poolPromises.push((async () => {
            const poolContract = new ethers.Contract(address, beethovenx.poolABI, provider);
            const poolId = await poolContract.getPoolId();
            const lastChangeBlock = (<BigNumber>(await vaultContract.getPoolTokens(poolId)).lastChangeBlock).toNumber();
            const blockInfo = await provider.getBlock(lastChangeBlock);

            // TODO: Check if pool is in master chef contract list (0x8166994d9ebBe5829EC86Bd81258149B87faCfd3)


            if(blockInfo) {
              const timestamp = blockInfo.timestamp;
              if ((Date.now() / 1000) - timestamp < maxInactiveTime) {
                beethovenxPools.pools.push(poolId);
              }
            }
          })());
        }
      } catch (err) {
        console.error(err);
      }
    }
    await Promise.all(poolPromises);

    // Writing File:
    fs.writeFile(`./functions/static/${filename}`, JSON.stringify(beethovenxPools, null, ' '), 'utf8', (err: any) => {
      if(err) {
        console.error(err);
      } else {
        console.info(`Successfully updated ${filename} file.`);
      }
    });
  }

  // Updating:
  console.log("Updating Beethovenx Pools. This may take a minute...");
  updateBeethovenxPools().catch(console.error);
}

/* ========================================================================================================================================================================= */