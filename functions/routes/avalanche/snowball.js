
// Imports:
const { ethers } = require('ethers');
const { minABI, snowball } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addS4DToken, addTraderJoeToken, addAxialToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'snowball';
const registry = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
const snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
const xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';

// <TODO> Migrate to Snowball's API - Sample Query Below
// {
//   LastSnowballInfo {
//     poolsInfo {
//       address,
//       lpAddress,
//       source,
//       symbol,
//       yearlyAPY,
//       token0 {
//         address,
//         symbol,
//       },
//       token1 {
//         address,
//         symbol,
//       },
//       token2 {
//         address,
//         symbol,
//       },
//       token3 {
//         address,
//         symbol,
//       },
//       deprecated,
//       gaugeInfo {
//         address
//       }
//     }
//   }
// }

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req) => {

  // Initializing Response:
  let response = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }

  // Getting Wallet Address:
  const wallet = req.query.address;

  // Checking Parameters:
  if(wallet != undefined) {
    if(ethers.utils.isAddress(wallet)) {
      try {
        response.data.push(...(await getStakedSNOB(wallet)));
        response.data.push(...(await getFarmBalances(wallet)));
      } catch(err) {
        console.error(err);
        response.status = 'error';
        response.data = [{error: 'Internal API Error'}];
      }
    } else {
      response.status = 'error';
      response.data = [{error: 'Invalid Wallet Address'}];
    }
  } else {
    response.status = 'error';
    response.data = [{error: 'No Wallet Address in Request'}];
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get staked SNOB balance:
const getStakedSNOB = async (wallet) => {
  let locked = await query(chain, xsnob, snowball.stakingABI, 'locked', [wallet]);
  let balance = parseInt(locked.amount);
  if(balance > 0) {
    let newToken = await addToken(chain, project, snob, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let farms = await query(chain, registry, snowball.registryABI, 'tokens', []);
  let snobRewards = 0;
  let promises = farms.map(farm => (async () => {
    let gauge = await query(chain, registry, snowball.registryABI, 'getGauge', [farm]);
    if(gauge != '0x0000000000000000000000000000000000000000') {
      let balance = parseInt(await query(chain, gauge, minABI, 'balanceOf', [wallet]));
      if(balance > 0) {
        let symbol = await query(chain, farm, minABI, 'symbol', []);

        // s4D StableVault:
        if(symbol === 's4D') {
          let newToken = await addS4DToken(chain, project, farm, balance, wallet);
          balances.push(newToken);

        // All Other Farms:
        } else {
          let token = await query(chain, farm, snowball.farmABI, 'token', []);
          let exchangeRatio = parseInt(await query(chain, farm, snowball.farmABI, 'getRatio', []));

          // Pangolin & Trader Joe Liquidity Pools:
          if(symbol.includes('PGL') || symbol.includes('JLP')) {
            let newToken = await addLPToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // xJOE Trader Joe Pool:
          } else if(symbol.includes('xJOE')) {
            let newToken = await addTraderJoeToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // Axial Pools:
          } else if(symbol.includes('AS4D') || symbol.includes('AC4D') || symbol.includes('AM3D') || symbol.includes('AA3D')) {
            let newToken = await addAxialToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // All Other Single-Asset Pools:
          } else {
            let newToken = await addToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);
          }
        }

        // Pending SNOB Rewards:
        let rewards = parseInt(await query(chain, gauge, snowball.gaugeABI, 'earned', [wallet]));
        if(rewards > 0) {
          snobRewards += rewards;
        }
      }
    }
  })());
  await Promise.all(promises);
  if(snobRewards > 0) {
    let newToken = await addToken(chain, project, snob, snobRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}