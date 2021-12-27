
// Imports:
const { ethers } = require('ethers');
const { minABI, belt } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, add4BeltToken, addBeltToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'belt';
const masterBelt = '0xD4BbC80b9B102b77B21A06cb77E954049605E6c1';
const rewardToken = '0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f';

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
  let beltRewards = 0;
  let poolLength = parseInt(await query(chain, masterBelt, belt.masterBeltABI, 'poolLength', []));
  let pools = [...Array(poolLength).keys()].filter(pool => pool != 0 && pool != 12 && pool != 13);
  let promises = pools.map(poolID => (async () => {
    let balance = parseInt(await query(chain, masterBelt, belt.masterBeltABI, 'stakedWantTokens', [poolID, wallet]));
    if(balance > 0) {
      let token = (await query(chain, masterBelt, belt.masterBeltABI, 'poolInfo', [poolID])).want;
      let symbol = await query(chain, token, minABI, 'symbol', []);

      // LP Tokens:
      if(symbol === 'Cake-LP') {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // 4Belt Token:
      } else if(symbol === '4Belt') {
        let newToken = await add4BeltToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Belt Tokens:
      } else {
        let newToken = await addBeltToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }

      // Pending BELT Rewards:
      let rewards = parseInt(await query(chain, masterBelt, belt.masterBeltABI, 'pendingBELT', [poolID, wallet]));
      if(rewards > 0) {
        beltRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);
  if(beltRewards > 0) {
    let newToken = await addToken(chain, project, rewardToken, beltRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}