
// Imports:
const { ethers } = require('ethers');
const { minABI, axial } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addAxialToken, addAxialMetaToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'axial';
const masterChef = '0x958C0d0baA8F220846d3966742D4Fb5edc5493D3';
const axialToken = '0xcF8419A615c57511807236751c0AF38Db4ba3351';

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

// Function to get all pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let poolCount = parseInt(await query(chain, masterChef, axial.masterChefABI, 'poolLength', []));
  let pools = [...Array(poolCount).keys()];
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt((await query(chain, masterChef, axial.masterChefABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, masterChef, axial.masterChefABI, 'poolInfo', [poolID])).lpToken;
      let symbol = await query(chain, token, minABI, 'symbol', []);

      // Standard LPs:
      if(symbol === 'JLP' || symbol === 'PGL') {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Axial Meta LPs:
      } else if(symbol.includes('-')) {
        let newToken = await addAxialMetaToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Axial LPs:
      } else {
        let newToken = await addAxialToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }

      // Pending Rewards:
      let rewards = await query(chain, masterChef, axial.masterChefABI, 'pendingTokens', [poolID, wallet]);
      if(rewards.pendingAxial > 0) {
        let newToken = await addToken(chain, project, axialToken, rewards.pendingAxial, wallet);
        balances.push(newToken);
      }
      if(rewards.pendingBonusToken > 0) {
        let newToken = await addToken(chain, project, rewards.bonusTokenAddress, rewards.pendingBonusToken, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}