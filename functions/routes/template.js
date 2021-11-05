
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
// <TODO - Change RPC required based on chain used, example: 'rpc_bsc', 'rpc_avax', etc>
const { rpc_eth } = require('../../static/RPCs.js');
// <TODO - Add any ABIs required, example below>
const { minABI, aave } = require('../../static/ABIs.js');

// Required Functions:
// <TODO - Add any functions required, addToken and addLPToken are the most common ones>
const { addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
// <TODO - Change values according to the route being added>
const chain = 'eth';
const project = 'aave';
// <TODO - Initialize any hard-coded addresses such as on-chain registries, token addresses, etc>

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
        // <TODO - Change the next line with the appropriate ethers provider setup>
        const eth = new ethers.providers.JsonRpcProvider(rpc_eth);
        // <TODO - Add data to response, example below>
        response.data.push(...(await getSomething(eth, wallet)));
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

// <TODO - Write the functions needed to fetch the route data here, example below - these should always return an array>
// Example function:
const getSomething = async (eth, wallet) => {
  // let contract = new ethers.Contract(aaveStaking, minABI, eth);
  // let balance = parseInt(await contract.balanceOf(wallet));
  // if(balance > 0) {
  //   let newToken = await addToken(chain, project, aaveToken, balance, wallet, eth);
  //   return [newToken];
  // } else {
  //   return [];
  // }
}