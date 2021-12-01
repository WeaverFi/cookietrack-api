
// Imports:
const { ethers } = require('ethers');
const { minABI, wonderland } = require('../../static/ABIs.js');
const { query, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'wonderland';
const time = '0xb54f16fB19478766A268F172C9480f8da1a7c9C3';
const memo = '0x136Acd46C134E8269052c62A67042D6bDeDde3C9';
const wmemo = '0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b';

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
        response.data.push(...(await getStakedTIME(wallet)));
        response.data.push(...(await getWrappedMEMO(wallet)));
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

// Function to get staked TIME balance:
const getStakedTIME = async (wallet) => {
  let balance = parseInt(await query(chain, memo, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, time, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get wrapped MEMO balance:
const getWrappedMEMO = async (wallet) => {
  let balance = parseInt(await query(chain, wmemo, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let actualBalance = parseInt(await query(chain, wmemo, wonderland.memoABI, 'wMEMOToMEMO', [ethers.BigNumber.from(balance.toString())]));
    let newToken = await addToken(chain, project, time, actualBalance, wallet);
    return [newToken];
  } else {
    return [];
  }
}