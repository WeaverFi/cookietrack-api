
// Imports:
const { ethers } = require('ethers');
const { minABI, lpABI, snowball, traderjoe, axial } = require('../../../static/ABIs.js');
const { query, getTokenLogo, getTokenPrice } = require('../../../static/functions.js');
const farms = require('./farms.json').farms;

// Initializations:
const chain = 'avax';

// <TODO> Migrate to Snowball's API:
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
        response.data.push(await getData(wallet));
      } catch {
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
  return JSON.stringify(response);
}

/* ========================================================================================================================================================================= */

// Function to get Snowball data:
const getData = async (wallet) => {
  let farmData = await getFarmBalances(wallet);
  let data = {
    strategyBalances: farmData.balances,
    earnedSNOB: farmData.snobRewards
  }
  return data;
}

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let snobRewards = 0;
  let promises = farms.map(farm => (async () => {
    let balance = parseInt(await query(chain, farm.gauge, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let symbol = await query(chain, farm.token, minABI, 'symbol', []);
      if(symbol === 's4D') {
        let controller = await query(chain, farm.token, snowball.s4dABI, 'owner', []);
        let newToken = {
          type: 'token',
          symbol: 's4D',
          address: farm.token,
          balance: balance / (10 ** 18),
          price: parseInt(await query(chain, controller, snowball.s4dControllerABI, 'getVirtualPrice', [])) / (10 ** 18),
          logo: getTokenLogo(chain, 's4D')
        }
        balances.push(newToken);
      } else {
        let token = await query(chain, farm.token, snowball.farmABI, 'token', []);
        let exchangeRatio = parseInt(await query(chain, farm.token, snowball.farmABI, 'getRatio', []));
        if(symbol.includes('PGL') || symbol.includes('JLP')) {
          let trueBalance = balance * (exchangeRatio / (10 ** 18));
          let decimals = parseInt(await query(chain, token, minABI, 'decimals', []));
          let lpTokenReserves = await query(chain, token, lpABI, 'getReserves', []);
          let lpTokenSupply = await query(chain, token, lpABI, 'totalSupply', []) / (10 ** decimals);
          let token0 = await query(chain, token, lpABI, 'token0', []);
          let decimals0 = parseInt(await query(chain, token0, minABI, 'decimals', []));
          let supply0 = lpTokenReserves[0] / (10 ** decimals);
          let symbol0 = await query(chain, token0, minABI, 'symbol', []);
          let token1 = await query(chain, token, lpABI, 'token1', []);
          let decimals1 = parseInt(await query(chain, token1, minABI, 'decimals', []));
          let supply1 = lpTokenReserves[1] / (10 ** decimals);
          let symbol1 = await query(chain, token1, minABI, 'symbol', []);
          let newToken = {
            type: 'lpToken',
            symbol: await query(chain, token, minABI, 'symbol', []),
            address: token,
            frozenAddress: farm.token,
            balance: trueBalance / (10 ** decimals),
            token0: {
              symbol: symbol0,
              address: token0,
              balance: (supply0 * (trueBalance / lpTokenSupply)) / (10 ** decimals0),
              price: await getTokenPrice(chain, token0, decimals0),
              logo: getTokenLogo(chain, symbol0)
            },
            token1: {
              symbol: symbol1,
              address: token1,
              balance: (supply1 * (trueBalance / lpTokenSupply)) / (10 ** decimals1),
              price: await getTokenPrice(chain, token1, decimals1),
              logo: getTokenLogo(chain, symbol1)
            }
          }
          balances.push(newToken);
        } else if(symbol.includes('xJOE')) {
          let decimals = parseInt(await query(chain, token, minABI, 'decimals', []));
          let symbol = await query(chain, token, minABI, 'symbol', []);
          let xjoeSupply = parseInt(await query(chain, token, minABI, 'totalSupply', []));
          let underlyingToken = await query(chain, token, traderjoe.joeABI, 'joe', []);
          let joeStaked = parseInt(await query(chain, underlyingToken, minABI, 'balanceOf', [token]));
          let multiplier = joeStaked / xjoeSupply;
          let newToken = {
            type: 'token',
            symbol: symbol,
            address: token,
            frozenAddress: farm.token,
            balance: (balance * (exchangeRatio / (10 ** 18))) / (10 ** decimals),
            price: multiplier * (await getTokenPrice(chain, underlyingToken, decimals)),
            logo: getTokenLogo(chain, symbol)
          }
          balances.push(newToken);
        } else if(symbol.includes('AS4D') || symbol.includes('AC4D') || symbol.includes('AM3D')) {
          let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
          let symbol = await query(chain, address, minABI, 'symbol', []);
          let swapAddress = await query(chain, address, axial.tokenABI, 'owner', []);
          let price = parseInt(await query(chain, swapAddress, axial.swapABI, 'getVirtualPrice', [])) / (10 ** decimals);
          let newToken = {
            type: 'token',
            symbol: symbol,
            address: token,
            frozenAddress: farm.token,
            balance: (balance * (exchangeRatio / (10 ** 18))) / (10 ** decimals),
            price: price,
            logo: getTokenLogo(chain, symbol)
          }
          balances.push(newToken);
        } else {
          let decimals = parseInt(await query(chain, token, minABI, 'decimals', []));
          let symbol = await query(chain, token, minABI, 'symbol', []);
          let newToken = {
            type: 'token',
            symbol: symbol,
            address: token,
            frozenAddress: farm.token,
            balance: (balance * (exchangeRatio / (10 ** 18))) / (10 ** decimals),
            price: await getTokenPrice(chain, token, decimals),
            logo: getTokenLogo(chain, symbol)
          }
          balances.push(newToken);
        }
      }
      let rewards = parseInt(await query(chain, farm.gauge, snowball.gaugeABI, 'earned', [wallet]));
      if(rewards > 0) {
        snobRewards += (rewards / (10 ** 18));
      }
    }
  })());
  await Promise.all(promises);
  return { balances, snobRewards };
}