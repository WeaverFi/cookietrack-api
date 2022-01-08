
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, beefy } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'beefy';
const staking = '0x7fB900C14c9889A559C777D016a885995cE759Ee';
const bifi = '0xd6070ae98b8069de6B494332d1A1a81B6179D960';
const wftm = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';

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
        let vaults = ((await axios.get(`https://api.beefy.finance/vaults?${randomChar}`)).data).filter(vault => vault.chain === 'fantom' && vault.status === 'active' && vault.tokenAddress);
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
        // None relevant / supported yet.

      // LP Token Vaults:
      } else if(vault.assets.length === 2 && vault.platform != 'StakeSteak' && vault.platform != 'Beethoven X') {
        let newToken = await addLPToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);

      // Single-Asset Vaults:
      } else if(vault.assets.length === 1) {
        if(vault.token === 'FTM') {
          let newToken = await addToken(chain, project, wftm, underlyingBalance, wallet);
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
    let newToken = await addToken(chain, project, wftm, pendingRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}