
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_one } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { one_tokens } = require('../../static/tokens/harmony.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

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
        const one = new ethers.providers.JsonRpcProvider(rpc_one);
        let oneBalance = await getONE(one, wallet);
        if(oneBalance) {
          response.data.push(oneBalance);
        }
        response.data.push(...(await getTokenBalances(one, wallet)));
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
const getONE = async (one, wallet) => {
  let balance = parseInt(await one.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to get token balances:
const getTokenBalances = async (one, wallet) => {
  let tokens = [];
  let promises = one_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, one);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, one);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}