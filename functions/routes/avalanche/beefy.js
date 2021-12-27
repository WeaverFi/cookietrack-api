
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, beefy } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'beefy';
const staking = '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A';
const bifi = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const wavax = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

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
        let vaults = ((await axios.get('https://api.beefy.finance/vaults')).data).filter(vault => vault.chain === 'avax' && vault.status === 'active' && vault.tokenAddress);
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
  return JSON.stringify(response);
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
        // None relevant / supported yet.

      // LP Token Vaults:
      } else if(vault.assets.length === 2) {
        let newToken = await addLPToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);

      // Single-Asset Vaults:
      } else if(vault.assets.length === 1) {
        if(vault.token === 'AVAX') {
          let newToken = await addToken(chain, project, wavax, underlyingBalance, wallet);
          balances.push(newToken);
        } else {
          let newToken = await addToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
          balances.push(newToken);
        }
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
    let newToken = await addToken(chain, project, wavax, pendingRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}