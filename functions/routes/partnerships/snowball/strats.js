
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_avax } = require('../../../static/RPCs.js');
const { minABI, lpABI, snowball, traderJoe } = require('../../../static/ABIs.js');

// Required Functions:
const { getTokenLogo, getTokenPrice } = require('../../../static/functions.js');

// Required Gauge List:
const farms = require('./farms.json').farms;

// Initializations:
const chain = 'avax';

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
        response.data.push(await getData(avax, wallet));
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

// Function to get Snowball data:
const getData = async (avax, wallet) => {
  let farmData = await getFarmBalances(avax, wallet);
  let data = {
    strategyBalances: farmData.balances,
    earnedSNOB: farmData.snobRewards
  }
  return data;
}

// Function to get farm balances:
const getFarmBalances = async (avax, wallet) => {
  let balances = [];
  let snobRewards = 0;
  let promises = farms.map(farm => (async () => {
    let gaugeContract = new ethers.Contract(farm.gauge, snowball.gaugeABI, avax);
    let balance = parseInt(await gaugeContract.balanceOf(wallet));
    if(balance > 0) {
      let farmContract = new ethers.Contract(farm.token, snowball.farmABI, avax);
      let symbol = await farmContract.symbol();
      if(symbol === 's4D') {
        let tokenContract = new ethers.Contract(farm.token, snowball.s4dABI, avax);
        let controller = await tokenContract.owner();
        let controllerContract = new ethers.Contract(controller, snowball.s4dControllerABI, avax);
        let newToken = {
          type: 'token',
          symbol: 's4D',
          address: farm.token,
          balance: balance / (10**18),
          price: parseInt(await controllerContract.getVirtualPrice()) / (10**18),
          logo: getTokenLogo(chain, 's4D')
        }
        balances.push(newToken);
      } else {
        let token = await farmContract.token();
        let exchangeRatio = parseInt(await farmContract.getRatio());
        if(symbol.includes('PGL') || symbol.includes('JLP')) {
          let trueBalance = balance * (exchangeRatio / (10**18));
          let contract = new ethers.Contract(token, minABI, avax);
          let decimals = parseInt(await contract.decimals());
          let lpTokenContract = new ethers.Contract(token, lpABI, avax);
          let lpTokenReserves = await lpTokenContract.getReserves();
          let lpTokenSupply = await lpTokenContract.totalSupply() / (10 ** decimals);
          let token0 = await lpTokenContract.token0();
          let token0_contract = new ethers.Contract(token0, minABI, avax);
          let decimals0 = parseInt(await token0_contract.decimals());
          let supply0 = lpTokenReserves[0] / (10 ** decimals);
          let symbol0 = await token0_contract.symbol();
          let token1 = await lpTokenContract.token1();
          let token1_contract = new ethers.Contract(token1, minABI, avax);
          let decimals1 = parseInt(await token0_contract.decimals());
          let supply1 = lpTokenReserves[1] / (10 ** decimals);
          let symbol1 = await token1_contract.symbol();
          let newToken = {
            type: 'lpToken',
            symbol: await contract.symbol(),
            address: token,
            balance: trueBalance / (10 ** decimals),
            token0: {
              symbol: symbol0,
              address: token0,
              balance: (supply0 * (trueBalance / lpTokenSupply)) / (10 ** decimals0),
              price: await getTokenPrice(chain, token0, decimals0),
              logo: getTokenLogo(chain, symbol0)
            },
            token1: {
              symbol: symbol1,
              address: token1,
              balance: (supply1 * (trueBalance / lpTokenSupply)) / (10 ** decimals1),
              price: await getTokenPrice(chain, token1, decimals1),
              logo: getTokenLogo(chain, symbol1)
            }
          }
          balances.push(newToken);
        } else if(symbol.includes('xJOE')) {
          let contract = new ethers.Contract(token, traderJoe.joeABI, avax);
          let decimals = parseInt(await contract.decimals());
          let symbol = await contract.symbol();
          let xjoeSupply = parseInt(await contract.totalSupply());
          let underlyingToken = await contract.joe();
          let joeContract = new ethers.Contract(underlyingToken, minABI, avax);
          let joeStaked = parseInt(await joeContract.balanceOf(token));
          let multiplier = joeStaked / xjoeSupply;
          let newToken = {
            type: 'token',
            symbol: symbol,
            address: token,
            balance: (balance * (exchangeRatio / (10**18))) / (10 ** decimals),
            price: multiplier * (await getTokenPrice(chain, underlyingToken, decimals)),
            logo: getTokenLogo(chain, symbol)
          }
          balances.push(newToken);
        } else {
          let contract = new ethers.Contract(token, minABI, avax);
          let decimals = parseInt(await contract.decimals());
          let symbol = await contract.symbol();
          let newToken = {
            type: 'token',
            symbol: symbol,
            address: token,
            balance: (balance * (exchangeRatio / (10**18))) / (10 ** decimals),
            price: await getTokenPrice(chain, token, decimals),
            logo: getTokenLogo(chain, symbol)
          }
          balances.push(newToken);
        }
      }
      let rewards = parseInt(await gaugeContract.earned(wallet));
      if(rewards > 0) {
        snobRewards += (rewards / (10**18));
      }
    }
  })());
  await Promise.all(promises);
  return { balances, snobRewards };
}