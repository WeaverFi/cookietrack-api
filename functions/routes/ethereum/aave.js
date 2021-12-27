
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, aave } = require('../../static/ABIs.js');
const { query, addToken, addAaveBLPToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'aave';
const aaveStaking = '0x4da27a545c0c5B758a6BA100e3a049001de870f5';
const lpStaking = '0xa1116930326D21fB917d5A27F1E9943A9595fb47';
const incentives = '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5';
const aaveToken = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';

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
        response.data.push(...(await getStakedAAVE(wallet)));
        response.data.push(...(await getStakedLP(wallet)));
        let markets = (await axios.get('https://aave.github.io/aave-addresses/mainnet.json')).data.proto;
        response.data.push(...(await getMarketBalances(wallet, markets)));
        response.data.push(...(await getMarketDebt(wallet, markets)));
        response.data.push(...(await getIncentives(wallet)));
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
  return JSON.stringify(response);
}

/* ========================================================================================================================================================================= */

// Function to get staked AAVE balance:
const getStakedAAVE = async (wallet) => {
  let balance = parseInt(await query(chain, aaveStaking, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, aaveToken, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get staked LP balance:
const getStakedLP = async (wallet) => {
  let balance = parseInt(await query(chain, lpStaking, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let tokenAddress = await query(chain, lpStaking, aave.stakingABI, 'STAKED_TOKEN', []);
    let newToken = await addAaveBLPToken(chain, project, tokenAddress, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

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
    let newToken = await addToken(chain, project, aaveToken, rewards, wallet);
    return [newToken];
  } else {
    return [];
  }
}