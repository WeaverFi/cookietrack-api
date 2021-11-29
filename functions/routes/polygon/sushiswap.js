
// Imports:
const { ethers } = require('ethers');
const { sushiswap } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'sushiswap';
const masterChef = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
const sushi = '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a';

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

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let sushiRewards = 0;

  // MasterChef Farms:
  let farmCount = parseInt(await query(chain, masterChef, sushiswap.masterChefABI, 'poolLength', []));
  let farms = [...Array(farmCount).keys()];
  let promises = farms.map(farmID => (async () => {
    let balance = parseInt((await query(chain, masterChef, sushiswap.masterChefABI, 'userInfo', [farmID, wallet])).amount);
    if(balance > 0) {
      let lpToken = await query(chain, masterChef, sushiswap.masterChefABI, 'lpToken', [farmID]);
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);

      // Pending SUSHI Rewards:
      let rewards = parseInt(await query(chain, masterChef, sushiswap.masterChefABI, 'pendingSushi', [farmID, wallet]));
      if(rewards > 0) {
        sushiRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);
  if(sushiRewards > 0) {
    let newToken = await addToken(chain, project, sushi, sushiRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}