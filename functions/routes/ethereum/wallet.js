
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_eth } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { eth_tokens } = require('../../static/tokens/ethereum.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';

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
        const eth = new ethers.providers.JsonRpcProvider(rpc_eth);
        let ethBalance = await getETH(eth, wallet);
        if(ethBalance) {
          response.data.push(ethBalance);
        }
        response.data.push(...(await getTokenBalances(eth, wallet)));
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
const getETH = async (eth, wallet) => {
  let balance = parseInt(await eth.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to get token balances:
const getTokenBalances = async (eth, wallet) => {
  let tokens = [];
  let promises = eth_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, eth);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, eth);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}