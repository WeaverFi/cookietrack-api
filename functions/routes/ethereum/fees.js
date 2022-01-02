
// Imports:
const { ethers } = require('ethers');
const { getSimpleTXs, getTokenPrice } = require('../../static/functions.js');

// Initializations:
const chain = 'eth';

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
        response.data.push(...(await getFees(wallet)));
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

// Function to get transaction fees' info:
const getFees = async (wallet) => {

  // Initializing Fees Object:
  let fees = {
    amount: 0,
    txs: 0,
    price: 0
  }

  // Fetching Fee Amount & TX Count:
  let txs = await getSimpleTXs(chain, wallet);
  let promises = txs.map(tx => (async () => {
    if(tx.direction === 'out') {
      fees.amount += tx.fee;
      fees.txs += 1;
    }
  })());
  await Promise.all(promises);

  // Fetching Native Token Price:
  fees.price = await getTokenPrice(chain, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);

  return [fees];
}