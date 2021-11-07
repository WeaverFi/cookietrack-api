
// Imports:
const { ethers } = require('ethers');
const { rpcs } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { one_tokens } = require('../../static/tokens/harmony.js');
const { query, addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'one';

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
        response.data.push(...(await getONE(wallet)));
        response.data.push(...(await getTokenBalances(wallet)));
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
const getONE = async (wallet) => {
  try {
    let one = new ethers.providers.JsonRpcProvider(rpcs.one);
    let balance = parseInt(await one.getBalance(wallet));
    if(balance > 0) {
      let newToken = await addNativeToken(chain, balance, wallet);
      return [newToken];
    } else {
      return [];
    }
  } catch {
    let one = new ethers.providers.JsonRpcProvider(rpcs.backups.one);
    let balance = parseInt(await one.getBalance(wallet));
    if(balance > 0) {
      let newToken = await addNativeToken(chain, balance, wallet);
      return [newToken];
    } else {
      return [];
    }
  }
}

// Function to get token balances:
const getTokenBalances = async (wallet) => {
  let tokens = [];
  let promises = one_tokens.map(token => (async () => {
    let balance = parseInt(await query(chain, token.address, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}