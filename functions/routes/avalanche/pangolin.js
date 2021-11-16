
// Imports:
const { ethers } = require('ethers');
const { minABI, pangolin } = require('../../static/ABIs.js');
const { query, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'pangolin';
const factory = '0xefa94DE7a4656D787667C749f7E1223D71E9FD88';

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
  let poolLength = parseInt(await query(chain, factory, pangolin.factoryABI, 'allPairsLength', []));
  let pools = [...Array(poolLength).keys()];
  let promises = pools.map(poolID => (async () => {
    let lpToken = parseInt(await query(chain, factory, pangolin.factoryABI, 'allPairs', [poolID]));
    let balance = parseInt(await query(chain, lpToken, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}