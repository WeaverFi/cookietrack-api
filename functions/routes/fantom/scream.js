
// Imports:
const { ethers } = require('ethers');
const { minABI, scream } = require('../../static/ABIs.js');
const { query, addToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'scream';
const controller = '0x260E596DAbE3AFc463e75B6CC05d8c46aCAcFB09';
const screamToken = '0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475';
const xscream = '0xe3D17C7e840ec140a7A51ACA351a482231760824';

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
        response.data.push(...(await getMarketBalances(wallet)));
        response.data.push(...(await getStakedSCREAM(wallet)));
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

// Function to get all market balances and debt:
const getMarketBalances = async (wallet) => {
  let balances = [];
  let markets = await query(chain, controller, scream.controllerABI, 'getAllMarkets', []);
  let promises = markets.map(market => (async () => {
    let balance = parseInt(await query(chain, market, minABI, 'balanceOf', [wallet]));
    let account = await query(chain, market, scream.marketABI, 'getAccountSnapshot', [wallet]);
    let debt = parseInt(account[2]);
    let exchangeRate = parseInt(account[3]);

    // Lending Balances:
    if(balance > 0) {
      let tokenAddress = await query(chain, market, scream.marketABI, 'underlying', []);
      let underlyingBalance = balance * (exchangeRate / (10 ** 18));
      let newToken = await addToken(chain, project, tokenAddress, underlyingBalance, wallet);
      balances.push(newToken);
    }

    // Borrowing Balances:
    if(debt > 0) {
      let tokenAddress = await query(chain, market, scream.marketABI, 'underlying', []);
      let newToken = await addDebtToken(chain, project, tokenAddress, debt, wallet);
      balances.push(newToken);
    }

  })());
  await Promise.all(promises);
  return balances;
}

// Function to get staked SCREAM balance:
const getStakedSCREAM = async (wallet) => {
  let balance = parseInt(await query(chain, xscream, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let exchangeRate = parseInt(await query(chain, xscream, scream.stakingABI, 'getShareValue', [])) / (10 ** 18);
    let newToken = await addToken(chain, project, screamToken, balance * exchangeRate, wallet);
    return [newToken];
  } else {
    return [];
  }
}