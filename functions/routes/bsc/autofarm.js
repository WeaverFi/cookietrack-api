
// Imports:
const { ethers } = require('ethers');
const { minABI, autofarm } = require('../../static/ABIs.js');
const { query, addToken, addLPToken, add4BeltToken, addBeltToken, addAlpacaToken } = require('../../static/functions.js');

// Initializations:
const chain = 'bsc';
const project = 'autofarm';
const registry = '0x0895196562C7868C5Be92459FaE7f877ED450452';
const autoVault = '0x763a05bdb9f8946d8C3FA72d1e0d3f5E68647e5C';
const auto = '0xa184088a740c695e156f91f5cc086a06bb78b827';
const ignoreVaults = [331];

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
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get all vault balances:
const getVaultBalances = async (wallet) => {
  let balances = [];
  let autoRewards = 0;
  let poolLength = parseInt(await query(chain, registry, autofarm.registryABI, 'poolLength', []));
  let vaults = [...Array(poolLength).keys()];
  let promises = vaults.map(vaultID => (async () => {

    // AUTO Vault:
    if(vaultID === 0) {
      let balance = parseInt(await query(chain, autoVault, autofarm.registryABI, 'stakedWantTokens', [0, wallet]));
      if(balance > 300000000000) {
        let newToken = await addToken(chain, project, auto, balance, wallet);
        balances.push(newToken);
      }
    
    // All Other Vaults:
    } else if(!ignoreVaults.includes(vaultID)) {
      let balance = parseInt(await query(chain, registry, autofarm.registryABI, 'stakedWantTokens', [vaultID, wallet]));
      if(balance > 99) {
        let token = (await query(chain, registry, autofarm.registryABI, 'poolInfo', [vaultID]))[0];
        let symbol = await query(chain, token, minABI, 'symbol', []);

        // Regular LP Vaults:
        if(symbol.endsWith('LP')) {
          let newToken = await addLPToken(chain, project, token, balance, wallet);
          balances.push(newToken);

        // 4Belt Vault:
        } else if(symbol === '4Belt') {
          let newToken = await add4BeltToken(chain, project, token, balance, wallet);
          balances.push(newToken);

        // Belt Vaults:
        } else if(symbol.startsWith('belt')) {
          let newToken = await addBeltToken(chain, project, token, balance, wallet);
          balances.push(newToken);

        // Alpaca Vaults:
        } else if(symbol.startsWith('ib')) {
          let newToken = await addAlpacaToken(chain, project, token, balance, wallet);
          balances.push(newToken);

        // Single-Asset Vaults:
        } else {
          let newToken = await addToken(chain, project, token, balance, wallet);
          balances.push(newToken);
        }

        // Pending AUTO Rewards:
        let rewards = parseInt(await query(chain, registry, autofarm.pendingRewardsABI, 'pendingAUTO', [vaultID, wallet]));
        if(rewards > 0) {
          autoRewards += rewards;
        }
      }
    }
  })());
  await Promise.all(promises);
  if(autoRewards > 0) {
    let newToken = await addToken(chain, project, auto, autoRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}