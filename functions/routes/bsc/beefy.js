
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, beefy } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, add4BeltToken, addBeltToken, addAlpacaToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'beefy';
const staking = '0x453d4ba9a2d594314df88564248497f7d74d6b2c';
const bifi = '0xca3f508b8e4dd382ee878a314789373d80a5190a';
const wbnb = '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7';

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
        let vaults = ((await axios.get('https://api.beefy.finance/vaults')).data).filter(vault => vault.chain === 'bsc' && vault.status === 'active' && vault.tokenAddress);
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

      // Unique Vaults (3+ Assets):
      if(vault.assets.length > 2) {
        if(vault.id === 'belt-4belt') {
          let newToken = await add4BeltToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
          balances.push(newToken);
        }

      // LP Token Vaults:
      } else if(vault.assets.length === 2 && vault.id != 'omnifarm-usdo-busd-ot' && vault.id != 'ellipsis-renbtc') {
        let newToken = await addLPToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
        balances.push(newToken);

      // Single-Asset Vaults:
      } else if(vault.assets.length === 1) {
        if(vault.platform === 'Belt') {
          let newToken = await addBeltToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
          balances.push(newToken);
        } else if(vault.platform === 'Alpaca') {
          let newToken = await addAlpacaToken(chain, project, vault.tokenAddress, underlyingBalance, wallet);
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
    let newToken = await addToken(chain, project, wbnb, pendingRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}