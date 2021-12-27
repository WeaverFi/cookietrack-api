
// Imports:
const { ethers } = require('ethers');
const { spookyswap } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'spookyswap';
const masterChef = '0x2b2929E785374c651a81A63878Ab22742656DcDd';
const boo = '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE';
const xboo = '0xa48d959AE2E88f1dAA7D5F611E01908106dE7598';

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
        response.data.push(...(await getPoolBalances(wallet)));
        response.data.push(...(await getStakedBOO(wallet)));
      } catch(err) {
        console.error(err);
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

// Function to get all pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let poolCount = parseInt(await query(chain, masterChef, spookyswap.masterChefABI, 'poolLength', []));
  let poolList = [...Array(poolCount).keys()];
  let promises = poolList.map(poolID => (async () => {
    let balance = parseInt((await query(chain, masterChef, spookyswap.masterChefABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, masterChef, spookyswap.masterChefABI, 'poolInfo', [poolID])).lpToken;
      let newToken = await addLPToken(chain, project, token, balance, wallet);
      balances.push(newToken);
      let rewards = parseInt(await query(chain, masterChef, spookyswap.masterChefABI, 'pendingBOO', [poolID, wallet]));
      if(rewards > 0) {
        let newToken = await addToken(chain, project, boo, rewards, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get staked BOO:
const getStakedBOO = async (wallet) => {
  let balance = parseInt(await query(chain, xboo, spookyswap.xbooABI, 'BOOBalance', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, boo, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}