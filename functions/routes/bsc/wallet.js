
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_bsc } = require('../../static/RPCs.js');
const { minABI } = require('../../static/ABIs.js');
const { bsc_tokens } = require('../../static/tokens/bsc.js');

// Required Functions:
const { addNativeToken, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';

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
        const bsc = new ethers.providers.JsonRpcProvider(rpc_bsc);
        let bscBalance = await getBNB(bsc, wallet);
        if(bscBalance) {
          response.data.push(bscBalance);
        }
        response.data.push(...(await getTokenBalances(bsc, wallet)));
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
const getBNB = async (bsc, wallet) => {
  let balance = parseInt(await bsc.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to get token balances:
const getTokenBalances = async (bsc, wallet) => {
  let tokens = [];
  let promises = bsc_tokens.map(token => (async () => {
    let tokenContract = new ethers.Contract(token.address, minABI, bsc);
    let balance = parseInt(await tokenContract.balanceOf(wallet));
    if(balance > 0) {
      let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, bsc);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}