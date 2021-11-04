
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Variables:
const { rpc_eth } = require('../../static/RPCs.js');
const { minABI, aave } = require('../../static/ABIs.js');

// Required Functions:
const { addToken, addAaveBLPToken, addDebtToken } = require('../../static/functions.js');

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
        const eth = new ethers.providers.JsonRpcProvider(rpc_eth);
        response.data.push(...(await getStakedAAVE(eth, wallet)));
        response.data.push(...(await getStakedLP(eth, wallet)));
        let markets = (await axios.get('https://aave.github.io/aave-addresses/mainnet.json')).data.proto;
        response.data.push(...(await getMarketBalances(eth, wallet, markets)));
        response.data.push(...(await getMarketDebt(eth, wallet, markets)));
        response.data.push(...(await getIncentives(eth, wallet)));
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

// Function to get staked AAVE balance:
const getStakedAAVE = async (eth, wallet) => {
  let contract = new ethers.Contract(aaveStaking, minABI, eth);
  let balance = parseInt(await contract.balanceOf(wallet));
  if(balance > 0) {
    let newToken = await addToken(chain, project, aaveToken, balance, wallet, eth);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get staked LP balance:
const getStakedLP = async (eth, wallet) => {
  let contract = new ethers.Contract(lpStaking, aave.stakingABI, eth);
  let balance = parseInt(await contract.balanceOf(wallet));
  if(balance > 0) {
    let tokenAddress = await contract.STAKED_TOKEN();
    let newToken = await addAaveBLPToken(chain, project, tokenAddress, balance, wallet, eth);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get lending market balances:
const getMarketBalances = async (eth, wallet, markets) => {
  let balances = [];
  let promises = markets.map(market => (async () => {
    let contract = new ethers.Contract(market.aTokenAddress, minABI, eth);
    let balance = parseInt(await contract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, project, market.address, balance, wallet, eth);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get lending market debt:
const getMarketDebt = async (eth, wallet, markets) => {
  let debt = [];
  let promises = markets.map(market => (async () => {
    let stableContract = new ethers.Contract(market.stableDebtTokenAddress, minABI, eth);
    let variableContract = new ethers.Contract(market.variableDebtTokenAddress, minABI, eth);
    let stableDebt = parseInt(await stableContract.balanceOf(wallet));
    let variableDebt = parseInt(await variableContract.balanceOf(wallet));
    let totalDebt = stableDebt + variableDebt;
    if(totalDebt > 0) {
      let newToken = await addDebtToken(chain, project, market.address, totalDebt, wallet, eth);
      debt.push(newToken);
    }
  })());
  await Promise.all(promises);
  return debt;
}

// Function to get unclaimed incentives:
const getIncentives = async (eth, wallet) => {
  let incentivesContract = new ethers.Contract(incentives, aave.incentivesABI, eth);
  let rewards = parseInt(await incentivesContract.getUserUnclaimedRewards(wallet));
  if(rewards > 0) {
    let newToken = await addToken(chain, project, aaveToken, rewards, wallet, eth);
    return [newToken];
  } else {
    return [];
  }
}