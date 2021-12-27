
// Imports:
const { ethers } = require('ethers');
const { pangolin } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'pangolin';
const controller = '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928';
const png = '0x60781c2586d68229fde47564546784ab3faca982';

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
        response.data.push(...(await getFarmBalances(wallet)));
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

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let pngRewards = 0;
  let poolCount = parseInt(await query(chain, controller, pangolin.controllerABI, 'poolLength', []));
  let farms = [...Array(poolCount).keys()];
  let promises = farms.map(farmID => (async () => {
    let balance = parseInt((await query(chain, controller, pangolin.controllerABI, 'userInfo', [farmID, wallet])).amount);
    if(balance > 0) {
      let lpToken = await query(chain, controller, pangolin.controllerABI, 'lpToken', [farmID]);
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);

      // Pending PNG Rewards:
      let rewards = parseInt(await query(chain, controller, pangolin.controllerABI, 'pendingReward', [farmID, wallet]));
      if(rewards > 0) {
        pngRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);
  if(pngRewards > 0) {
    let newToken = await addToken(chain, project, png, pngRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}