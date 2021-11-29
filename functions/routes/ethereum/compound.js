
// Imports:
const { ethers } = require('ethers');
const { minABI, compound } = require('../../static/ABIs.js');
const { query, addToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'compound';
const controller = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';

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
  let markets = await query(chain, controller, compound.controllerABI, 'getAllMarkets', []);
  let promises = markets.map(market => (async () => {
    let balance = parseInt(await query(chain, market, minABI, 'balanceOf', [wallet]));
    let account = await query(chain, market, compound.marketABI, 'getAccountSnapshot', [wallet]);
    let debt = parseInt(account[2]);
    let exchangeRate = parseInt(account[3]);

    // Lending Balances:
    if(balance > 0) {
      let tokenAddress = '';
      if(market.toLowerCase() === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, compound.marketABI, 'underlying', []);
      }
      let underlyingBalance = balance * (exchangeRate / (10**18));
      let newToken = await addToken(chain, project, tokenAddress, underlyingBalance, wallet);
      balances.push(newToken);
    }

    // Borrowing Balances:
    if(debt > 0) {
      let tokenAddress = '';
      if(market.toLowerCase() === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, compound.marketABI, 'underlying', []);
      }
      let newToken = await addDebtToken(chain, project, tokenAddress, debt, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}