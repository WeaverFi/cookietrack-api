
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_avax } = require('../../static/RPCs.js');
const { snowball } = require('../../static/ABIs.js');

// Required Functions:
const { addToken, addLPToken, addS4DToken, addTraderJoeToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'snowball';
const registry = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
const snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
const xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';

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
        const avax = new ethers.providers.JsonRpcProvider(rpc_avax);
        response.data.push(...(await getStakedSNOB(avax, wallet)));
        response.data.push(...(await getFarmBalances(avax, wallet)));
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

// Function to get staked SNOB balance:
const getStakedSNOB = async (avax, wallet) => {
  let stakingContract = new ethers.Contract(xsnob, snowball.stakingABI, avax);
  let locked = await stakingContract.locked(wallet);
  let balance = parseInt(locked.amount);
  if(balance > 0) {
    let newToken = await addToken(chain, project, snob, balance, wallet, avax);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get farm balances:
const getFarmBalances = async (avax, wallet) => {
  let balances = [];
  let registryContract = new ethers.Contract(registry, snowball.registryABI, avax);
  let farms = await registryContract.tokens();
  let snobRewards = 0;
  let promises = farms.map(farm => (async () => {
    let gauge = await registryContract.getGauge(farm);
    if(gauge != '0x0000000000000000000000000000000000000000') {
      let gaugeContract = new ethers.Contract(gauge, snowball.gaugeABI, avax);
      let balance = parseInt(await gaugeContract.balanceOf(wallet));
      if(balance > 0) {
        let farmContract = new ethers.Contract(farm, snowball.farmABI, avax);
        let symbol = await farmContract.symbol();
        if(symbol === 's4D') {
          let newToken = await addS4DToken(chain, project, farm, balance, wallet, avax);
          balances.push(newToken);
        } else {
          let token = await farmContract.token();
          let exchangeRatio = parseInt(await farmContract.getRatio());
          if(symbol.includes('PGL') || symbol.includes('JLP')) {
            let newToken = await addLPToken(chain, project, token, balance * (exchangeRatio / (10**18)), wallet, avax);
            balances.push(newToken);
          } else if(symbol.includes('xJOE')) {
            let newToken = await addTraderJoeToken(chain, project, token, balance * (exchangeRatio / (10**18)), wallet, avax);
            balances.push(newToken);
          } else {
            let newToken = await addToken(chain, project, token, balance * (exchangeRatio / (10**18)), wallet, avax);
            balances.push(newToken);
          }
        }
        let rewards = parseInt(await gaugeContract.earned(wallet));
        if(rewards > 0) {
          snobRewards += rewards;
        }
      }
    }
  })());
  await Promise.all(promises);
  if(snobRewards > 0) {
    let newToken = await addToken(chain, project, snob, snobRewards, wallet, avax);
    balances.push(newToken);
  }
  return balances;
}