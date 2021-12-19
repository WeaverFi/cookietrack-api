
// Imports:
const { ethers } = require('ethers');
const { minABI, xmaspast } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'xmaspast';
const masterChef = '0x138c4dB5D4Ab76556769e4ea09Bce1D452c2996F';
const xpast = '0xD3111Fb8BDf936B11fFC9eba3b597BeA21e72724';

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
  let poolCount = parseInt(await query(chain, masterChef, xmaspast.masterChefABI, 'poolLength', []));
  let pools = [...Array(poolCount).keys()];
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt((await query(chain, masterChef, xmaspast.masterChefABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, masterChef, xmaspast.masterChefABI, 'poolInfo', [poolID])).lpToken;
      let symbol = await query(chain, token, minABI, 'symbol', []);

      // LP Token Pools:
      if(symbol === 'spLP') {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Other Pools:
      } else {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }

      // Pending XPAST Rewards:
      let rewards = parseInt(await query(chain, masterChef, xmaspast.masterChefABI, 'pendingXpast', [poolID, wallet]));
      if(rewards > 0) {
        let newToken = await addToken(chain, project, xpast, rewards, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}