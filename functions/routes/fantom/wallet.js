
// Imports:
const { ethers } = require('ethers');
const { rpcs } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { ftm_tokens } = require('../../static/tokens/fantom.js');
const { query, addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';

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
        response.data.push(...(await getFTM(wallet)));
        response.data.push(...(await getTokenBalances(wallet)));
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

// Function to get native wallet balance:
const getFTM = async (wallet) => {
  try {
    let ftm = new ethers.providers.JsonRpcProvider(rpcs.ftm);
    let balance = parseInt(await ftm.getBalance(wallet));
    if(balance > 0) {
      let newToken = await addNativeToken(chain, balance, wallet);
      return [newToken];
    } else {
      return [];
    }
  } catch {
    let ftm = new ethers.providers.JsonRpcProvider(rpcs.backups.ftm);
    let balance = parseInt(await ftm.getBalance(wallet));
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
  let promises = ftm_tokens.map(token => (async () => {
    let balance = parseInt(await query(chain, token.address, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}