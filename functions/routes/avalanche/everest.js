
// Imports:
const { ethers } = require('ethers');
const { minABI, everest } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'everest';
const evrt = '0x3ACa5545e76746A3Fe13eA66B24BC0eBcC51E6b4';
const pevrt = '0x451D00AF6E751537a9A2cFF40CdFB1119cd1fA7d';
const farms = [
  '0x13B2e894E3e7D60c0E084ab5Cc47552d7cfE40C4',
  '0xE34E22bC053D529c649EA3808Bbc1caA43687cdb',
  '0xD81Bbd31D6dA2b0D52f8c02B276940Be9423c1d3',
  '0x6f34201abc4fFAA2d3C86563Bc603bc3c0BD8f7f',
  '0xbA6B26AE795C68770A86C6D020e952B60a48da5f',
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
        response.data.push(...(await getFarmBalances(wallet)));
        response.data.push(...(await getStakedEVRT(wallet)));
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

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let evrtRewards = 0;
  let promises = farms.map(farm => (async () => {
    let balance = parseInt(await query(chain, farm, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {

      // pEVRT Farm:
      if(farm === farms[0]) {
        let exchangeRate = parseInt(await query(chain, pevrt, everest.stakingABI, 'currentExchangeRate', [])) / (10 ** 18);
        let newToken = await addToken(chain, project, evrt, balance * exchangeRate, wallet);
        balances.push(newToken);

      // LP Farms:
      } else {
        let lpToken = await query(chain, farm, everest.farmABI, 'stakingToken', []);
        let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
        balances.push(newToken);
      }
      
      // Pending EVRT Rewards:
      let rewards = parseInt(await query(chain, farm, everest.farmABI, 'earned', [wallet]));
      if(rewards > 0) {
        evrtRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);
  if(evrtRewards > 0) {
    let newToken = await addToken(chain, project, evrt, evrtRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}

// Function to get staked EVRT balance:
const getStakedEVRT = async (wallet) => {
  let balance = parseInt(await query(chain, pevrt, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let exchangeRate = parseInt(await query(chain, pevrt, everest.stakingABI, 'currentExchangeRate', [])) / (10 ** 18);
    let newToken = await addToken(chain, project, evrt, balance * exchangeRate, wallet);
    return [newToken];
  } else {
    return [];
  }
}