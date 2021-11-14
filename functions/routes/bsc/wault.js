
// Imports:
const { ethers } = require('ethers');
const { wault } = require('../../static/ABIs.js');
const { query, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'wault';
const master = '0x22fB2663C7ca71Adc2cc99481C77Aaf21E152e2D';

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

// Function to get pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let poolLength = parseInt(await query(chain, master, wault.masterABI, 'poolLength', []));
  let pools = [...Array(poolLength).keys()];
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt((await query(chain, master, wault.masterABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      if(poolID != 3 && poolID != 25) {
        let token = (await query(chain, master, wault.masterABI, 'poolInfo', [poolID])).lpToken;
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}