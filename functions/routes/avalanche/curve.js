
// Imports:
const { ethers } = require('ethers');
const { minABI, curve } = require('../../static/ABIs.js');
const { query, addToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'curve';
const pools = [
  '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858', // Aave Gauge
  '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1', // renBTC Gauge
  '0x445FE580eF8d70FF569aB36e80c647af338db351'  // ATriCrypto Gauge
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
  let promises = pools.map(gauge => (async () => {
    let balance = parseInt(await query(chain, gauge, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let token = await query(chain, gauge, curve.gaugeABI, 'lp_token', []);
      let newToken = await addCurveToken(chain, project, token, balance, wallet);
      balances.push(newToken);

      // Pending Rewards:
      for(let i = 0; i < 2; i++) {
        let token = await query(chain, gauge, curve.gaugeABI, 'reward_tokens', [i]);
        if(token != '0x0000000000000000000000000000000000000000') {
          let rewards = parseInt(await query(chain, gauge, curve.gaugeABI, 'claimable_reward', [wallet, token]));
          if(rewards > 0) {
            let newToken = await addToken(chain, project, token, rewards, wallet);
            balances.push(newToken);
          }
        }
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}