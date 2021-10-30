
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_avax } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { avax_tokens } = require('../../static/tokens/avalanche.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';

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
        const avax = new ethers.providers.JsonRpcProvider(rpc_avax);
        let avaxBalance = await getAVAX(avax, wallet);
        if(avaxBalance) {
          response.data.push(avaxBalance);
        }
        response.data.push(...(await getTokenBalances(avax, wallet)));
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
const getAVAX = async (avax, wallet) => {
  let balance = parseInt(await avax.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to get token balances:
const getTokenBalances = async (avax, wallet) => {
  let tokens = [];
  let promises = avax_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, avax);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, avax);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}