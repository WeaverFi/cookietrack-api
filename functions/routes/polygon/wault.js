
// Imports:
const { ethers } = require('ethers');
const { wault } = require('../../static/ABIs.js');
const { query, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'wault';
const master = '0xc8bd86e5a132ac0bf10134e270de06a8ba317bfe';

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
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let poolLength = parseInt(await query(chain, master, wault.masterABI, 'poolLength', []));
  let pools = [...Array(poolLength).keys()];
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt((await query(chain, master, wault.masterABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      if(poolID != 1) {
        let token = (await query(chain, master, wault.masterABI, 'poolInfo', [poolID])).lpToken;
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}