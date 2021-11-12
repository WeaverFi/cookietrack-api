
// Imports:
const { ethers } = require('ethers');
const { minABI, autofarm } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addCurveToken } = require('../../static/functions.js');

// Initializations:
const chain = 'ftm';
const project = 'autofarm';
const registry = '0x76b8c3ECdF99483335239e66F34191f11534cbAA';

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

// Function to get all vault balances:
const getVaultBalances = async (wallet) => {
  let balances = [];
  let poolLength = parseInt(await query(chain, registry, autofarm.registryABI, 'poolLength', []));
  let vaults = [...Array(poolLength).keys()];
  let promises = vaults.map(vaultID => (async () => {
    if(vaultID != 75 && vaultID != 76) {
      let balance = parseInt(await query(chain, registry, autofarm.registryABI, 'stakedWantTokens', [vaultID, wallet]));
      if(balance > 99) {
        let token = (await query(chain, registry, autofarm.registryABI, 'poolInfo', [vaultID]))[0];
        let symbol = await query(chain, token, minABI, 'symbol', []);
  
        // Curve Vaults:
        if(vaultID === 39 || vaultID === 40 || vaultID === 41 || vaultID === 66 || vaultID === 69) {
          let newToken = await addCurveToken(chain, project, token, balance, wallet);
          balances.push(newToken);
  
        // LP Token Vaults:
        } else if(symbol.includes('LP')) {
          let newToken = await addLPToken(chain, project, token, balance, wallet);
          balances.push(newToken);
  
        // Single-Asset Vaults:
        } else {
          let newToken = await addToken(chain, project, token, balance, wallet);
          balances.push(newToken);
        }
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}