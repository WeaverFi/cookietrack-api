
// Imports:
const { ethers } = require('ethers');
const { minABI, cream } = require('../../static/ABIs.js');
const { query, addToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'cream';
const controller = '0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc';

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

// Function to get all market balances and debt:
const getMarketBalances = async (wallet) => {
  let balances = [];
  let markets = await query(chain, controller, cream.controllerABI, 'getAllMarkets', []);
  let promises = markets.map(market => (async () => {

    // Lending Balances:
    let balance = parseInt(await query(chain, market, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let exchangeRate = parseInt(await query(chain, market, cream.tokenABI, 'exchangeRateStored', []));
      let decimals = parseInt(await query(chain, market, minABI, 'decimals', []));
      let tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      let underlyingBalance = (balance / (10 ** decimals)) * (exchangeRate / (10 ** (decimals + 2)));
      let newToken = await addToken(chain, project, tokenAddress, underlyingBalance, wallet);
      balances.push(newToken);
    }

    // Borrowing Balances:
    let debt = parseInt(await query(chain, market, cream.tokenABI, 'borrowBalanceStored', [wallet]));
    if(debt > 0) {
      let tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      let newToken = await addDebtToken(chain, project, tokenAddress, debt, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}