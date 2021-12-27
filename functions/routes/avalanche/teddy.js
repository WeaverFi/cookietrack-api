
// Imports:
const { ethers } = require('ethers');
const { teddy } = require('../../static/ABIs.js');
const { query, addToken, addDebtToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'teddy';
const trove = '0xd22b04395705144Fd12AfFD854248427A2776194';
const stabilityPool = '0x7AEd63385C03Dc8ed2133F705bbB63E8EA607522';
const staking = '0xb4387D93B5A9392f64963cd44389e7D9D2E1053c';
const tsd = '0x4fbf0429599460D327BD5F55625E30E4fC066095';
const teddyToken = '0x094bd7B2D99711A1486FB94d4395801C6d0fdDcC';
const avax = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

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
        response.data.push(...(await getTroveBalance(wallet)));
        response.data.push(...(await getStabilityPoolBalance(wallet)));
        response.data.push(...(await getStakedTEDDY(wallet)));
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

// Function to get trove balance:
const getTroveBalance = async (wallet) => {
  let balances = [];
  let userInfo = await query(chain, trove, teddy.troveABI, 'Troves', [wallet]);
  if(parseInt(userInfo.status) === 1) {
    let debt = parseInt(userInfo.debt);
    if(debt > 0) {
      let newToken = await addDebtToken(chain, project, tsd, debt, wallet);
      balances.push(newToken);
    }
    let collateral = parseInt(userInfo.coll);
    if(collateral > 0) {
      let newToken = await addToken(chain, project, avax, collateral, wallet);
      balances.push(newToken);
    }
  }
  return balances;
}

// Function to get stability pool balance:
const getStabilityPoolBalance = async (wallet) => {
  let balances = [];
  let userInfo = await query(chain, stabilityPool, teddy.stabilityPoolABI, 'deposits', [wallet]);
  let balance = parseInt(userInfo.initialValue);
  if(balance > 0) {
    let newToken = await addToken(chain, project, tsd, balance, wallet);
    balances.push(newToken);
    let avaxRewards = await query(chain, stabilityPool, teddy.stabilityPoolABI, 'getDepositorETHGain', [wallet]);
    if(avaxRewards > 0) {
      let newToken = await addToken(chain, project, avax, avaxRewards, wallet);
      balances.push(newToken);
    }
    let teddyRewards = await query(chain, stabilityPool, teddy.stabilityPoolABI, 'getDepositorLQTYGain', [wallet]);
    if(teddyRewards > 0) {
      let newToken = await addToken(chain, project, teddyToken, teddyRewards, wallet);
      balances.push(newToken);
    }
  }
  return balances;
}

// Function to get staked TEDDY balance:
const getStakedTEDDY = async (wallet) => {
  let balances = [];
  let balance = await query(chain, staking, teddy.stakingABI, 'stakes', [wallet]);
  if(balance > 0) {
    let newToken = await addToken(chain, project, teddyToken, balance, wallet);
    balances.push(newToken);
    let avaxRewards = await query(chain, staking, teddy.stakingABI, 'getPendingETHGain', [wallet]);
    if(avaxRewards > 0) {
      let newToken = await addToken(chain, project, avax, avaxRewards, wallet);
      balances.push(newToken);
    }
    let tsdRewards = await query(chain, staking, teddy.stakingABI, 'getPendingLUSDGain', [wallet]);
    if(tsdRewards > 0) {
      let newToken = await addToken(chain, project, tsd, tsdRewards, wallet);
      balances.push(newToken);
    }
  }
  return balances;
}