
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { moonpot } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, add4BeltToken, addBeltToken, addAlpacaToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'moonpot';

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
        let pots = [];
        let apiData = ((await axios.get('https://api.moonpot.com/pots')).data.data);
        Object.keys(apiData).forEach(pot => {
          if(apiData[pot].status === 'active') {
            pots.push(apiData[pot]);
          }
        });
        response.data.push(...(await getPotBalances(wallet, pots)));
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

// Function to get pot balances:
const getPotBalances = async (wallet, pots) => {
  let balances = [];
  let promises = pots.map(pot => (async () => {
    let balance = parseInt(await query(chain, pot.contractAddress, moonpot.potABI, 'userTotalBalance', [wallet]));
    if(balance > 0) {

      // 4Belt Pot:
      if(pot.token.includes('4Belt')) {
        let newToken = await add4BeltToken(chain, project, pot.tokenAddress, balance, wallet);
        balances.push(newToken);

      // Belt Pots:
      } else if(pot.token.startsWith('belt')) {
        let newToken = await addBeltToken(chain, project, pot.tokenAddress, balance, wallet);
        balances.push(newToken);

      // Alpaca Pots:
      } else if(pot.token.startsWith('ib')) {
        let newToken = await addAlpacaToken(chain, project, pot.tokenAddress, balance, wallet);
        balances.push(newToken);

      // LP Pots:
      } else if(pot.token.endsWith('LP')) {
        let newToken = await addLPToken(chain, project, pot.tokenAddress, balance, wallet);
        balances.push(newToken);

      // Single-Asset Pots:
      } else {
        let newToken = await addToken(chain, project, pot.tokenAddress, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}