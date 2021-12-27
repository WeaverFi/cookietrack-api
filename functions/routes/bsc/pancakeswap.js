
// Imports:
const { ethers } = require('ethers');
const { pancakeswap } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'pancakeswap';
const registry = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
const autoCakePool = '0xa80240Eb5d7E05d3F250cF000eEc0891d00b51CC';
const cake = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';

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
        response.data.push(...(await getAutoCakePoolBalance(wallet)));
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
  let cakeRewards = 0;
  let poolLength = parseInt(await query(chain, registry, pancakeswap.registryABI, 'poolLength', []));
  let farms = [...Array(poolLength).keys()];
  let promises = farms.map(farmID => (async () => {
    let balance = parseInt((await query(chain, registry, pancakeswap.registryABI, 'userInfo', [farmID, wallet]))[0]);
    if(balance > 0) {
      let token = (await query(chain, registry, pancakeswap.registryABI, 'poolInfo', [farmID]))[0];

      // Single-Asset Cake Farm:
      if(farmID === 0) {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // All Other Farms:
      } else {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }

      // Pending Cake Rewards:
      let rewards = parseInt(await query(chain, registry, pancakeswap.registryABI, 'pendingCake', [farmID, wallet]));
      if(rewards > 0) {
        cakeRewards += rewards;
      }
    }
  })());
  await Promise.all(promises);
  if(cakeRewards > 0) {
    let newToken = await addToken(chain, project, cake, cakeRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}

// Function to get CAKE in auto-compounding pool:
const getAutoCakePoolBalance = async (wallet) => {
  let balance = parseInt((await query(chain, autoCakePool, pancakeswap.autoCakePoolABI, 'userInfo', [wallet]))[0]);
  if(balance > 0) {
    let multiplier = parseInt(await query(chain, autoCakePool, pancakeswap.autoCakePoolABI, 'getPricePerFullShare', [])) / (10 ** 18);
    let actualBalance = balance * multiplier;
    let newToken = await addToken(chain, project, cake, actualBalance, wallet);
    return [newToken];
  } else {
    return [];
  }
}