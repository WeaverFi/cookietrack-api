
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, aave } = require('../../static/ABIs.js');
const { query, addToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'aave';
const incentives = '0x357D51124f59836DeD84c8a1730D72B749d8BC23';
const wmatic = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

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
        let markets = (await axios.get('https://aave.github.io/aave-addresses/polygon.json')).data.matic;
        response.data.push(...(await getMarketBalances(wallet, markets)));
        response.data.push(...(await getMarketDebt(wallet, markets)));
        response.data.push(...(await getIncentives(wallet)));
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

// Function to get lending market balances:
const getMarketBalances = async (wallet, markets) => {
  let balances = [];
  let promises = markets.map(market => (async () => {
    let balance = parseInt(await query(chain, market.aTokenAddress, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, project, market.address, balance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get lending market debt:
const getMarketDebt = async (wallet, markets) => {
  let debt = [];
  let promises = markets.map(market => (async () => {
    let stableDebt = parseInt(await query(chain, market.stableDebtTokenAddress, minABI, 'balanceOf', [wallet]));
    let variableDebt = parseInt(await query(chain, market.variableDebtTokenAddress, minABI, 'balanceOf', [wallet]));
    let totalDebt = stableDebt + variableDebt;
    if(totalDebt > 0) {
      let newToken = await addDebtToken(chain, project, market.address, totalDebt, wallet);
      debt.push(newToken);
    }
  })());
  await Promise.all(promises);
  return debt;
}

// Function to get unclaimed incentives:
const getIncentives = async (wallet) => {
  let rewards = parseInt(await query(chain, incentives, aave.incentivesABI, 'getUserUnclaimedRewards', [wallet]));
  if(rewards > 0) {
    let newToken = await addToken(chain, project, wmatic, rewards, wallet);
    return [newToken];
  } else {
    return [];
  }
}