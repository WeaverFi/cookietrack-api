
// Imports:
const { ethers } = require('ethers');
const { minABI, cream } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'cream';
const controller = '0x589de0f0ccf905477646599bb3e5c622c84cc0ba';

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
      let symbol = await query(chain, market, minABI, 'symbol', []);
      let tokenAddress = '';
      if(market.toLowerCase() === '0x1Ffe17B99b439bE0aFC831239dDECda2A790fF3A'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      }
      let underlyingBalance = (balance / (10 ** decimals)) * (exchangeRate / (10 ** (decimals + 2)));
      if(symbol.includes('CAKE-LP')) {
        let newToken = await addLPToken(chain, project, tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);
      } else {
        let newToken = await addToken(chain, project, tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);
      }
    }

    // Borrowing Balances:
    let debt = parseInt(await query(chain, market, cream.tokenABI, 'borrowBalanceStored', [wallet]));
    if(debt > 0) {
      let symbol = await query(chain, market, minABI, 'symbol', []);
      let tokenAddress = '';
      if(market.toLowerCase() === '0x1Ffe17B99b439bE0aFC831239dDECda2A790fF3A'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      }
      if(!symbol.includes('CAKE-LP')) {
        let newToken = await addDebtToken(chain, project, tokenAddress, debt, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}