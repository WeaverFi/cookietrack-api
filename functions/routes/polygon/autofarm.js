
// Imports:
const { ethers } = require('ethers');
const { minABI, autofarm } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, addCurveToken, addBZXToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'autofarm';
const registry = '0x89d065572136814230a55ddeeddec9df34eb0b76';

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
  let poolLength = parseInt(await query(chain, registry, autofarm.polyRegistryABI, 'poolLength', []));
  let vaults = [...Array(poolLength).keys()];
  let promises = vaults.map(vaultID => (async () => {
    let balance = parseInt(await query(chain, registry, autofarm.polyRegistryABI, 'stakedWantTokens', [vaultID, wallet]));
    if(balance > 99) {
      let token = (await query(chain, registry, autofarm.polyRegistryABI, 'poolInfo', [vaultID]))[0];
      let symbol = await query(chain, token, minABI, 'symbol', []);

      // Curve Vaults:
      if(vaultID === 66 || vaultID === 97 || vaultID === 98) {
        let newToken = await addCurveToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // BZX I-Token Vaults:
      } else if(vaultID > 58 && vaultID < 66) {
        let newToken = await addBZXToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // LP Token Vaults:
      } else if(symbol.includes('LP') || symbol === 'UNI-V2') {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Single-Asset Vaults:
      } else {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}