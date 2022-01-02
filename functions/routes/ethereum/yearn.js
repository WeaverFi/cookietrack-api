
// Imports:
const { ethers } = require('ethers');
const { minABI, yearn } = require('../../static/ABIs.js');
const { query, addToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';
const project = 'yearn';
const deployer = '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804';
const yTokenList = [
  '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01', // yDAI v2
  '0xC2cB1040220768554cf699b0d863A3cd4324ce32', // yDAI v3
  '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e', // yUSDC v2
  '0x26EA744E5B887E5205727f55dFBE8685e3b21951', // yUSDC v3
  '0x83f798e925BcD4017Eb265844FDDAbb448f1707D', // yUSDT v2
  '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447', // yUSDT v3
  '0x73a052500105205d34Daf004eAb301916DA8190f', // yTUSD
  '0xF61718057901F84C4eEC4339EF8f0D86D2B45600', // ySUSD
  '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9'  // yWBTC
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
        response.data.push(...(await getVaultBalances(wallet)));
        response.data.push(...(await getTokenBalances(wallet)));
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

// Function to get all vault balances:
const getVaultBalances = async (wallet) => {
  let balances = [];
  let tokenCount = parseInt(await query(chain, deployer, yearn.deployerABI, 'numTokens', []));
  let vaults = [...Array(tokenCount).keys()];
  let promises = vaults.map(vaultID => (async () => {
    let token = await query(chain, deployer, yearn.deployerABI, 'tokens', [vaultID]);
    let vaultCount = await query(chain, deployer, yearn.deployerABI, 'numVaults', [token]);
    if(vaultCount > 0) {
      for(let i = 0; i < vaultCount; i++) {
        let vault = await query(chain, deployer, yearn.deployerABI, 'vaults', [token, i]);
        let balance = parseInt(await query(chain, vault, minABI, 'balanceOf', [wallet]));
        if(balance > 0) {
          let underlyingToken = await query(chain, vault, yearn.vaultABI, 'token', []);
          let multiplier = await query(chain, vault, yearn.vaultABI, 'pricePerShare', []);
          let decimals = await query(chain, vault, minABI, 'decimals', []);
          let underlyingBalance = balance * (multiplier / (10 ** decimals));
          let symbol = await query(chain, underlyingToken, minABI, 'symbol', []);
          if(symbol.startsWith('crv')) {
            let newToken = await addCurveToken(chain, project, underlyingToken, underlyingBalance, wallet);
            balances.push(newToken);
          } else {
            let newToken = await addToken(chain, project, underlyingToken, underlyingBalance, wallet);
            balances.push(newToken);
          }
        }
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get all yToken Balances:
const getTokenBalances = async (wallet) => {
  let balances = [];
  let promises = yTokenList.map(token => (async () => {
    let balance = parseInt(await query(chain, token, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let underlyingToken = await query(chain, token, yearn.tokenABI, 'token', []);
      let multiplier = await query(chain, token, yearn.tokenABI, 'getPricePerFullShare', []);
      let decimals = await query(chain, token, minABI, 'decimals', []);
      let underlyingBalance = balance * (multiplier / (10 ** decimals));
      let newToken = await addToken(chain, project, underlyingToken, underlyingBalance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}