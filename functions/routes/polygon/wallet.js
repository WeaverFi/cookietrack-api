
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_poly } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { poly_tokens } = require('../../static/tokens/polygon.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

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
        const poly = new ethers.providers.JsonRpcProvider(rpc_poly);
        let polyBalance = await getMATIC(poly, wallet);
        if(polyBalance) {
          response.data.push(polyBalance);
        }
        response.data.push(...(await getTokenBalances(poly, wallet)));
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
const getMATIC = async (poly, wallet) => {
  let balance = parseInt(await poly.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to get token balances:
const getTokenBalances = async (poly, wallet) => {
  let tokens = [];
  let promises = poly_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, poly);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, poly);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}