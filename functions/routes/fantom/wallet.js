
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_ftm } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { ftm_tokens } = require('../../static/tokens/fantom.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

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
        const ftm = new ethers.providers.JsonRpcProvider(rpc_ftm);
        response.data.push(...(await getFTM(ftm, wallet)));
        response.data.push(...(await getTokenBalances(ftm, wallet)));
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
const getFTM = async (ftm, wallet) => {
  let balance = parseInt(await ftm.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get token balances:
const getTokenBalances = async (ftm, wallet) => {
  let tokens = [];
  let promises = ftm_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, ftm);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, ftm);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}