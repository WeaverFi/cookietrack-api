
// Imports:
const { ethers } = require('ethers');
const { sushiswap } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'sushiswap';
const masterChef = '0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd';
const masterChefV2 = '0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d';
const sushi = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2';

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
        response.data.push(...(await getFarmBalances(wallet)));
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

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let sushiRewards = 0;

  // MasterChef Farms:
  let farmCount = parseInt(await query(chain, masterChef, sushiswap.masterChefABI, 'poolLength', []));
  let farms = [...Array(farmCount).keys()];
  let promises = farms.map(farmID => (async () => {
    let balance = parseInt((await query(chain, masterChef, sushiswap.masterChefABI, 'userInfo', [farmID, wallet])).amount);
    if(balance > 0) {
      let lpToken = (await query(chain, masterChef, sushiswap.masterChefABI, 'poolInfo', [farmID])).lpToken;
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);

      // Pending SUSHI Rewards:
      let rewards = parseInt(await query(chain, masterChef, sushiswap.masterChefABI, 'pendingSushi', [farmID, wallet]));
      if(rewards > 0) {
        sushiRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);

  // MasterChef V2 Farms:
  let farmCount_V2 = parseInt(await query(chain, masterChefV2, sushiswap.masterChefABI, 'poolLength', []));
  let farms_V2 = [...Array(farmCount_V2).keys()];
  let promises_V2 = farms_V2.map(farmID => (async () => {
    let balance = parseInt((await query(chain, masterChefV2, sushiswap.masterChefABI, 'userInfo', [farmID, wallet])).amount);
    if(balance > 0) {
      let lpToken = await query(chain, masterChefV2, sushiswap.masterChefABI, 'lpToken', [farmID]);
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);

      // Pending SUSHI Rewards:
      let rewards = parseInt(await query(chain, masterChefV2, sushiswap.masterChefABI, 'pendingSushi', [farmID, wallet]));
      if(rewards > 0) {
        sushiRewards += rewards;
      }
    }
  })());
  await Promise.all(promises_V2);
  if(sushiRewards > 0) {
    let newToken = await addToken(chain, project, sushi, sushiRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}