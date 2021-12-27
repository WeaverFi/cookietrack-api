
// Imports:
const { ethers } = require('ethers');
const { minABI, curve } = require('../../static/ABIs.js');
const { query, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'curve';
const registry = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';

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
  return JSON.stringify(response);
}

/* ========================================================================================================================================================================= */

// Function to get pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let poolCount = parseInt(await query(chain, registry, curve.registryABI, 'pool_count', []));
  let pools = [...Array(poolCount).keys()];
  let promises = pools.map(poolID => (async () => {
    let address = await query(chain, registry, curve.registryABI, 'pool_list', [poolID]);
    let gauge = (await query(chain, registry, curve.registryABI, 'get_gauges', [address]))[0][0];
    if(gauge != '0x0000000000000000000000000000000000000000') {
      let balance = parseInt(await query(chain, gauge, minABI, 'balanceOf', [wallet]));
      if(balance > 0) {
        let token = await query(chain, gauge, curve.gaugeABI, 'lp_token', []);
        let newToken = await addCurveToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}