
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, beefy } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addCurveToken, addIronToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'beefy';
const staking = '0xDeB0a777ba6f59C78c654B8c92F80238c8002DD2';
const bifi = '0xfbdd194376de19a88118e84e279b977f165d01b8';
const wmatic = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

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
        let chars = 'abcdefghijklmnopqrstuvwxyz';
        let randomChar = chars[Math.floor(Math.random() * chars.length)];
        let vaults = ((await axios.get(`https://api.beefy.finance/vaults?${randomChar}`)).data).filter(vault => vault.chain === 'polygon' && vault.status === 'active' && vault.tokenAddress);
        response.data.push(...(await getVaultBalances(wallet, vaults)));
        response.data.push(...(await getStakedBIFI(wallet)));
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

// Function to get vault balances:
const getVaultBalances = async (wallet, vaults) => {
  let balances = [];
  let promises = vaults.map(vault => (async () => {
    let balance = parseInt(await query(chain, vault.earnedTokenAddress, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let decimals = parseInt(await query(chain, vault.earnedTokenAddress, minABI, 'decimals', []));
      let exchangeRate = parseInt(await query(chain, vault.earnedTokenAddress, beefy.vaultABI, 'getPricePerFullShare', []));
      let underlyingBalance = balance * (exchangeRate / (10 ** decimals));

      // Curve Vaults:
      if(vault.platform === 'Curve') {
        let newToken = await addCurveToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);

      // Unique Vaults (3+ Assets):
      } else if(vault.assets.length > 2) {
        if(vault.paltform === 'IronFinance') {
          let newToken = await addIronToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
          balances.push(newToken);
        }

      // LP Token Vaults:
      } else if(vault.assets.length === 2 && vault.platform != 'Kyber') {
        let newToken = await addLPToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);

      // Single-Asset Vaults:
      } else if(vault.assets.length === 1) {
        let newToken = await addToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get staked BIFI balance:
const getStakedBIFI = async (wallet) => {
  let balances = [];
  let balance = parseInt(await query(chain, staking, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, bifi, balance, wallet);
    balances.push(newToken);
  }
  let pendingRewards = parseInt(await query(chain, staking, beefy.stakingABI, 'earned', [wallet]));
  if(pendingRewards > 0) {
    let newToken = await addToken(chain, project, wmatic, pendingRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}