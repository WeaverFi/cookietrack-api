
// Imports:
const web3 = require('@solana/web3.js');
const axios = require('axios');
const { beachKey } = require('../../static/keys.js');
const { sol_tokens } = require('../../static/tokens/solana.js');
const { query, isAddress, addNativeToken, addToken } = require('../../static/sol-functions.js');

// Initializations:
const chain = 'sol';

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
    let walletCheck = await isAddress(wallet);
    if(walletCheck[0]) {
      try {
        response.data.push(...(await getSOL(wallet, walletCheck[1])));
        if(walletCheck[1] === 0) {
          response.data.push(...(await getTokenBalances(wallet)));
        }
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

// Function to get native wallet balance:
const getSOL = async (wallet, type) => {
  let balance = await query('getBalance', [new web3.PublicKey(wallet)]);
  if(balance > 0) {

    // Staking Wallet:
    if(type === 1) {
      let newToken = await addToken(chain, 'staking_sol', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'SOL', 9, balance, wallet);
      return [newToken];

    // Standard Wallet:
    } else {
      let newToken = await addNativeToken(chain, balance, wallet);
      return [newToken];
    }
  } else {
    return [];
  }
}

// Function to get token balances:
const getTokenBalances = async (wallet) => {
  let tokens = [];
  let apiQuery = 'https://api.solanabeach.io/v1/account/' + wallet + '/tokens';
  let apiTokens = (await axios.get(apiQuery, { headers: { 'Authorization': `Bearer ${beachKey}` }})).data;
  let promises = apiTokens.map(token => (async () => {
    if(token.amount > 0) {
      let sol_token = sol_tokens.find(i => i.address.toLowerCase() === token.mint.address.toLowerCase());
      if(sol_token) {
        let newToken = await addToken(chain, 'wallet', sol_token.address, sol_token.symbol, token.decimals, token.amount, wallet);
        tokens.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return tokens;
}