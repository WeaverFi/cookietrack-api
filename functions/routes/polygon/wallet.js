
// Imports:
const { ethers } = require('ethers');
const { rpcs } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { poly_tokens } = require('../../static/tokens/polygon.js');
const { query, addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';

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
        response.data.push(...(await getMATIC(wallet)));
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
const getMATIC = async (wallet) => {
  try {
    let poly = new ethers.providers.JsonRpcProvider(rpcs.poly);
    let balance = parseInt(await poly.getBalance(wallet));
    if(balance > 0) {
      let newToken = await addNativeToken(chain, balance, wallet);
      return [newToken];
    } else {
      return [];
    }
  } catch {
    let poly = new ethers.providers.JsonRpcProvider(rpcs.backups.poly);
    let balance = parseInt(await poly.getBalance(wallet));
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
  let promises = poly_tokens.map(token => (async () => {
    let balance = parseInt(await query(chain, token.address, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}