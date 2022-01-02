
// Imports:
const { ethers } = require('ethers');
const { minABI, mstable } = require('../../static/ABIs.js');
const { query, addToken, addStableToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'mstable';
const imUSD = '0x5290Ad3d83476CA6A2b178Cd9727eE1EF72432af';
const imUSDVault = '0x32aBa856Dc5fFd5A56Bcd182b13380e5C855aa29';
const pools = [
  '0xB30a907084AC8a0d25dDDAB4E364827406Fd09f0'
];
const mta = '0xf501dd45a1198c2e1b5aef5314a68b9006d842e0';

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
        response.data.push(...(await getAssetBalances(wallet)));
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

// Function to get asset balances:
const getAssetBalances = async (wallet) => {
  let balances = [];

  // imUSD:
  let usdAssetBalance = parseInt(await query(chain, imUSD, minABI, 'balanceOf', [wallet]));
  if(usdAssetBalance > 0) {
    let decimals = parseInt(await query(chain, imUSD, minABI, 'decimals', []));
    let exchangeRate = parseInt(await query(chain, imUSD, mstable.assetABI, 'exchangeRate', [])) / (10 ** decimals);
    let token = await query(chain, imUSD, mstable.assetABI, 'underlying', []);
    let newToken = await addToken(chain, project, token, usdAssetBalance * exchangeRate, wallet);
    balances.push(newToken);
  }

  // imUSD Vault:
  let usdVaultBalance = parseInt(await query(chain, imUSDVault, minABI, 'balanceOf', [wallet]));
  if(usdVaultBalance > 0) {
    let decimals = parseInt(await query(chain, imUSD, minABI, 'decimals', []));
    let exchangeRate = parseInt(await query(chain, imUSD, mstable.assetABI, 'exchangeRate', [])) / (10 ** decimals);
    let token = await query(chain, imUSD, mstable.assetABI, 'underlying', []);
    let newToken = await addToken(chain, project, token, usdVaultBalance * exchangeRate, wallet);
    balances.push(newToken);
    let rewards = parseInt(await query(chain, imUSDVault, mstable.vaultABI, 'earned', [wallet]));
    if(rewards > 0) {
      let newToken = await addToken(chain, project, mta, rewards, wallet);
      balances.push(newToken);
    }
  }

  return balances;
}

// Function to get pool balances:
const getPoolBalances = async (wallet) => {
  let balances = [];
  let promises = pools.map(lpToken => (async () => {
    let balance = parseInt(await query(chain, lpToken, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addStableToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}