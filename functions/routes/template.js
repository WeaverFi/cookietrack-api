
// Imports:
const { ethers } = require('ethers');
const { minABI, aave } = require('../../static/ABIs.js'); // <TODO> Edit to include all the ABIs you need.
const { query, addToken, addLPToken } = require('../../static/functions.js'); // <TODO> Edit to include all functions you need.

// Initializations:
const chain = 'eth'; // <TODO> Edit to be the chain the route is dependent on.
const project = 'aave'; // <TODO> Edit to be the name of the dapp being added.
// <TODO> Initialize any other hard-coded addresses such as on-chain registries, token addresses, etc.

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
        response.data.push(...(await getSomething(wallet))); // <TODO> Edit to include all data necessary in response. You can have multiples of these.
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

// Example function:
const getSomething = async (wallet) => {
  // let balance = parseInt(await query(chain, address, minABI, 'balanceOf', [wallet]));
  // if(balance > 0) {
  //   let newToken = await addToken(chain, project, aaveToken, balance, wallet);
  //   return [newToken];
  // } else {
  //   return [];
  // }
}