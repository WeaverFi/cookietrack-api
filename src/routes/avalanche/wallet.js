
// Required Packages:
const { ethers } = require('ethers');

// Imports:
import { rpc_avax } from '../../RPCs.js';
import { minABI } from '../../ABIs.js';
import { avax_tokens } from '../../tokens/avalanche.js';
import { addNativeToken, addToken } from '../../functions.js';

// Initializations:
const chain = 'avax';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req, res) => {

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
        response.data.push(await getAVAX(avax, wallet));
        response.data.push(await getTokenBalances(avax, wallet));
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

  // Sending Response:
  res.end(JSON.stringify(response));
}

/* ========================================================================================================================================================================= */

// Function to fetch native wallet balance:
const getAVAX = async (avax, wallet) => {
  let balance = parseInt(await avax.getBalance(wallet));
  if(balance > 0) {
    let newToken = await addNativeToken(chain, balance, wallet);
    return newToken;
  }
}

// Function to fetch token balances:
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