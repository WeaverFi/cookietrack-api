
// Imports:
const { ethers } = require('ethers');
const { minABI, cookiegame } = require('../../static/ABIs.js');
const { query, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'cookiegame';
const bakery = '0xBeF3C25eA2d17124609e8a98226C23026841B75e';
const pantry = '0x8482653003021761cFBDa30c233f8930eb434b26';
const cookie = '0x97bB36F8dF689E0cA3b58FddC316b8514E86C5A7';

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
        response.data.push(...(await getBakeryBalance(wallet)));
        response.data.push(...(await getPantryBalance(wallet)));
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

// Function to get bakery COOKIE balance:
const getBakeryBalance = async (wallet) => {
  let balance = parseInt(await query(chain, bakery, cookiegame.bakeryABI, 'ownedStakesBalance', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, cookie, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get pantry COOKIE balance:
const getPantryBalance = async (wallet) => {
  let balance = parseInt(await query(chain, pantry, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, cookie, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}