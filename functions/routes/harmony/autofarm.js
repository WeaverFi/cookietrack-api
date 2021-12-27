
// Imports:
const { ethers } = require('ethers');
const { autofarm } = require('../../static/ABIs.js');
const { query, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'one';
const project = 'autofarm';
const registry = '0x67da5f2ffaddff067ab9d5f025f8810634d84287';

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

// Function to get all vault balances:
const getVaultBalances = async (wallet) => {
  let balances = [];
  let poolLength = parseInt(await query(chain, registry, autofarm.oneRegistryABI, 'poolLength', []));
  let vaults = [...Array(poolLength).keys()];
  let promises = vaults.map(vaultID => (async () => {
    let balance = parseInt(await query(chain, registry, autofarm.oneRegistryABI, 'userInfo', [vaultID, wallet]));
    if(balance > 99) {
      let lpToken = await query(chain, registry, autofarm.oneRegistryABI, 'lpToken', [vaultID]);
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}