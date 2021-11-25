
// Imports:
const { ethers } = require('ethers');
const { minABI, pooltogether } = require('../../static/ABIs.js');
const { query, addToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'pooltogether';
const pools = [
  '0x06D75Eb5cA4Da7F7C7A043714172CF109D07a5F8',
  '0x2f4Fc07E4Bd097C68774E5bdAbA98d948219F827'
];

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
  let promises = pools.map(pool => (async () => {
    let ticket = (await query(chain, pool, pooltogether.poolABI, 'tokens', []))[0];
    let balance = parseInt(await query(chain, ticket, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let token = await query(chain, pool, pooltogether.poolABI, 'token', []);
      let newToken = await addToken(chain, project, token, balance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}