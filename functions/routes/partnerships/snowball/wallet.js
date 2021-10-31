
// Required Packages:
const { ethers } = require('ethers');

// Required Variables:
const { rpc_avax } = require('../../../static/RPCs.js');
const { minABI, snowball } = require('../../../static/ABIs.js');

// Initializations:
const snob = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
const xsnob = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';

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
        const avax = new ethers.providers.JsonRpcProvider(rpc_avax);
        response.data.push(await getData(avax, wallet));
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

// Function to get Snowball data:
const getData = async (avax, wallet) => {
  let balance = await getSNOB(avax, wallet);
  let stakedSNOB = await getStakedSNOB(avax, wallet);
  let data = {
    snob: balance,
    staked: {
      amount: stakedSNOB.balance,
      end: stakedSNOB.unlock
    }
  }
  return data;
}

// Function to get wallet SNOB balance:
const getSNOB = async (avax, wallet) => {
  let tokenContract = new ethers.Contract(snob, minABI, avax);
  let balance = parseInt(await tokenContract.balanceOf(wallet)) / (10**18);
  return balance;
}

// Function to get staked SNOB balance:
const getStakedSNOB = async (avax, wallet) => {
  let stakingContract = new ethers.Contract(xsnob, snowball.stakingABI, avax);
  let locked = await stakingContract.locked(wallet);
  let balance = parseInt(locked.amount) / (10**18);
  let unlock = parseInt(locked.end);
  return { balance, unlock };
}