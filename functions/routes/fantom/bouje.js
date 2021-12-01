
// Imports:
const { ethers } = require('ethers');
const { bouje } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'bouje';
const masterChef = '0x89dcd1DC698Ad6A422ad505eFE66261A4320D8B5';
const boujeToken = '0x37F70aa9fEfc8971117BD53A1Ddc2372aa7Eec41';

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
  let poolCount = parseInt(await query(chain, masterChef, bouje.masterChefABI, 'poolLength', []));
  let pools = [...Array(poolCount).keys()];
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt((await query(chain, masterChef, bouje.masterChefABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, masterChef, bouje.masterChefABI, 'poolInfo', [poolID])).lpToken;

      // LP Token Pools:
      if(poolID > 0 && poolID < 4) {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Other Pools:
      } else {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }

      // Pending BOUJE Rewards:
      let rewards = parseInt(await query(chain, masterChef, bouje.masterChefABI, 'pendingBouje', [poolID, wallet]));
      if(rewards > 0) {
        let newToken = await addToken(chain, project, boujeToken, rewards, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}