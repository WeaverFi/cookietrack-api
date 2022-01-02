
// Imports:
const { ethers } = require('ethers');
const { minABI, curve } = require('../../static/ABIs.js');
const { query, addToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'curve';
const pools = [
  '0x3b6b158a76fd8ccc297538f454ce7b4787778c7c', // ATriCrypto Gauge
  '0x19793B454D3AfC7b454F206Ffe95aDE26cA6912c', // Aave Gauge
  '0xffbACcE0CC7C19d46132f1258FC16CF6871D153c', // renBTC Gauge
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