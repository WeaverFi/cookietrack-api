
// Imports:
const { ethers } = require('ethers');
const { avalaunch } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'avalaunch';
const staking = '0xA6A01f4b494243d84cf8030d982D7EeB2AeCd329';
const lpStaking = '0x6E125b68F0f1963b09add1b755049e66f53CC1EA';
const lpToken = '0x42152bDD72dE8d6767FE3B4E17a221D6985E8B25';
const xava = '0xd1c3f94de7e5b45fa4edbba472491a9f4b166fc4';

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
        response.data.push(...(await getStakedXAVA(wallet)));
        response.data.push(...(await getStakedLP(wallet)));
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

// Function to get staked XAVA balance:
const getStakedXAVA = async (wallet) => {
  let xavaBalance = 0;
  let balance = parseInt(await query(chain, staking, avalaunch.stakingABI, 'deposited', [0, wallet]));
  if(balance > 0) {
    xavaBalance += balance;
    let pendingXAVA = parseInt(await query(chain, staking, avalaunch.stakingABI, 'pending', [0, wallet]));
    if(pendingXAVA > 0) {
      xavaBalance += pendingXAVA;
    }
    let newToken = await addToken(chain, project, xava, xavaBalance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get staked LP balance:
const getStakedLP = async (wallet) => {
  let balances = [];
  let balance = parseInt(await query(chain, lpStaking, avalaunch.stakingABI, 'deposited', [0, wallet]));
  if(balance > 0) {
    let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
    balances.push(newToken);
    let pendingXAVA = parseInt(await query(chain, lpStaking, avalaunch.stakingABI, 'pending', [0, wallet]));
    if(pendingXAVA > 0) {
      let newToken = await addToken(chain, project, xava, pendingXAVA, wallet);
      balances.push(newToken);
    }
  }
  return balances;
}