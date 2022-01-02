
// Imports:
const { ethers } = require('ethers');
const { minABI, cream } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'cream';
const controller0 = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const controller1 = '0xab1c342c7bf5ec5f02adea1c2270670bca144cbb';
const staking = [
  '0x780F75ad0B02afeb6039672E6a6CEDe7447a8b45',
  '0xBdc3372161dfd0361161e06083eE5D52a9cE7595',
  '0xD5586C1804D2e1795f3FBbAfB1FBB9099ee20A6c',
  '0xE618C25f580684770f2578FAca31fb7aCB2F5945'
];
const creamToken = '0x2ba592f78db6436527729929aaf6c908497cb200';

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
        response.data.push(...(await getMarketBalances(wallet)));
        response.data.push(...(await getStakedCREAM(wallet)));
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

// Function to get all market balances and debt:
const getMarketBalances = async (wallet) => {
  let balances = [];
  let markets0 = await query(chain, controller0, cream.controllerABI, 'getAllMarkets', []);
  let markets1 = await query(chain, controller1, cream.controllerABI, 'getAllMarkets', []);
  let markets = markets0.concat(markets1);
  let promises = markets.map(market => (async () => {

    // Lending Balances:
    let balance = parseInt(await query(chain, market, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let exchangeRate = parseInt(await query(chain, market, cream.tokenABI, 'exchangeRateStored', []));
      let decimals = parseInt(await query(chain, market, minABI, 'decimals', []));
      let symbol = await query(chain, market, minABI, 'symbol', []);
      let tokenAddress = '';
      if(market.toLowerCase() === '0xD06527D5e56A3495252A528C4987003b712860eE'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      }
      let underlyingBalance = (balance / (10 ** decimals)) * (exchangeRate / (10 ** (decimals + 2)));
      if(symbol.includes('UNI-') || symbol.includes('SLP')) {
        let newToken = await addLPToken(chain, project, tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);
      } else if(!symbol.includes('Curve')) {
        let newToken = await addToken(chain, project, tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);
      }
    }

    // Borrowing Balances:
    let debt = parseInt(await query(chain, market, cream.tokenABI, 'borrowBalanceStored', [wallet]));
    if(debt > 0) {
      let symbol = await query(chain, market, minABI, 'symbol', []);
      let tokenAddress = '';
      if(market.toLowerCase() === '0xD06527D5e56A3495252A528C4987003b712860eE'.toLowerCase()) {
        tokenAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      } else {
        tokenAddress = await query(chain, market, cream.tokenABI, 'underlying', []);
      }
      if(!symbol.includes('UNI-') && !symbol.includes('SLP') && !symbol.includes('Curve')) {
        let newToken = await addDebtToken(chain, project, tokenAddress, debt, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get staked CREAM balances:
const getStakedCREAM = async (wallet) => {
  let balances = [];
  let promises = staking.map(address => (async () => {
    let balance = parseInt(await query(chain, address, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, project, creamToken, balance, wallet);
      balances.push(newToken);
    }
    let earned = parseInt(await query(chain, address, cream.stakingABI, 'earned', [wallet]));
    if(earned > 0) {
      let newToken = await addToken(chain, project, creamToken, earned, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}