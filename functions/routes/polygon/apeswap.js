
// Imports:
const { ethers } = require('ethers');
const { minABI, apeswap } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'poly';
const project = 'apeswap';
const masterApe = '0x54aff400858Dcac39797a81894D9920f16972D1D';
const vaultMaster = '0x37ac7DE40A6fd71FD1559Aa00F154E8dcb72efdb';
const banana = '0x5d47baba0d66083c52009271faf3f50dcc01023c';

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
        response.data.push(...(await getFarmBalances(wallet)));
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

// Function to get farm balances:
const getFarmBalances = async (wallet) => {
  let balances = [];
  let bananaRewards = 0;
  let farmCount = parseInt(await query(chain, masterApe, apeswap.polyMasterApeABI, 'poolLength', []));
  let farms = [...Array(farmCount).keys()];
  let promises = farms.map(farmID => (async () => {
    let balance = parseInt((await query(chain, masterApe, apeswap.polyMasterApeABI, 'userInfo', [farmID, wallet])).amount);
    if(balance > 0) {
      let lpToken = await query(chain, masterApe, apeswap.polyMasterApeABI, 'lpToken', [farmID]);
      let newToken = await addLPToken(chain, project, lpToken, balance, wallet);
      balances.push(newToken);

      // Pending BANANA Rewards:
      let rewards = parseInt(await query(chain, masterApe, apeswap.polyMasterApeABI, 'pendingBanana', [farmID, wallet]));
      if(rewards > 0) {
        bananaRewards += rewards;
      }

      // Bonus Rewards:
      let rewarder = await query(chain, masterApe, apeswap.polyMasterApeABI, 'rewarder', [farmID]);
      let bonusRewards = parseInt(await query(chain, rewarder, apeswap.rewarderABI, 'pendingToken', [farmID, wallet]));
      if(bonusRewards > 0) {
        let token = await query(chain, rewarder, apeswap.rewarderABI, 'rewardToken', []);
        let newToken = await addToken(chain, project, token, bonusRewards, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  if(bananaRewards > 0) {
    let newToken = await addToken(chain, project, banana, bananaRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}

// Function to get vault balances:
const getVaultBalances = async (wallet) => {
  let balances = [];
  let vaultCount = parseInt(await query(chain, vaultMaster, apeswap.vaultMasterABI, 'poolLength', []));
  let vaults = [...Array(vaultCount).keys()];
  let promises = vaults.map(vaultID => (async () => {
    let balance = parseInt(await query(chain, vaultMaster, apeswap.vaultMasterABI, 'stakedWantTokens', [vaultID, wallet]));
    if(balance > 0) {
      let token = (await query(chain, vaultMaster, apeswap.vaultMasterABI, 'poolInfo', [vaultID])).want;
      let symbol = await query(chain, token, minABI, 'symbol', []);

      // LP Vaults:
      if(symbol.endsWith('LP')) {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);

      // Other Vaults:
      } else {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}