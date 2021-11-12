
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { minABI, snowball } = require('../../../static/ABIs.js');
const { query } = require('../../../static/functions.js');
const farms = require('./farms.json').farms;

// Initializations:
const chain = 'avax';

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
        response.data.push(await getData(wallet));
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
const getData = async (wallet) => {
  let deposits = await getDeposits(wallet);
  let data = {
    deposits
  }
  return data;
}

// Function to get deposits in farms:
const getDeposits = async (wallet) => {
  let deposits = [];
  let promises = farms.map(farm => (async () => {
    let balance = parseInt(await query(chain, farm.gauge, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let symbol = await query(chain, farm.token, minABI, 'symbol', []);
      if(symbol != 's4D') {
        let underlyingAddress = await query(chain, farm.token, snowball.farmABI, 'token', []);
        let deposit = {
          asset: symbol,
          frozenAddress: farm.token,
          value: 0,
          actions: []
        }
        deposit.actions = await getFarmTXs(wallet, deposit.frozenAddress, underlyingAddress);
        deposit.actions.forEach(action => {
          action.direction === 'deposit' ? deposit.value += action.value : deposit.value -= action.value;
        });
        deposits.push(deposit);
      }
    }
  })());
  await Promise.all(promises);
  return deposits;
}

// Function to get farm transactions:
const getFarmTXs = async (wallet, frozenAddress, underlyingAddress) => {
  let txs = [];
  let page = 0;
  let hasNextPage = false;
  do {
    let apiQuery = 'https://api.covalenthq.com/v1/43114/address/' + wallet + '/transfers_v2/?contract-address=' + underlyingAddress + '&page-size=100&page-number=' + page++ + '&key=ckey_0b5c83bec14443ec943c27d7450';
    let response = await axios.get(apiQuery);
    if(!response.data.error) {
      hasNextPage = response.data.data.pagination.has_more;
      response.data.data.items.forEach(async (tx) => {
        if(tx.successful) {
          tx.transfers.forEach(transfer => {
            if(transfer.transfer_type === 'OUT' && transfer.to_address.toLowerCase() === frozenAddress.toLowerCase()) {
              txs.push({
                direction: 'deposit',
                hash: tx.tx_hash,
                time: (new Date(tx.block_signed_at)).getTime() / 1000,
                value: parseInt(transfer.delta) / (10 ** transfer.contract_decimals)
              });
            } else if(transfer.transfer_type === 'IN' && transfer.from_address.toLowerCase() === frozenAddress.toLowerCase()) {
              txs.push({
                direction: 'withdrawal',
                hash: tx.tx_hash,
                time: (new Date(tx.block_signed_at)).getTime() / 1000,
                value: parseInt(transfer.delta) / (10 ** transfer.contract_decimals)
              });
            }
          });
        }
      });
    }
  } while(hasNextPage);
  return txs;
}