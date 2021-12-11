
// Imports:
const { ethers } = require('ethers');
const axios = require('axios');
const { getTXs } = require('../../static/functions.js');
const { ckey } = require('../../static/keys.js');

// Initializations:
const chain = 'avax';
const id = 43114;

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
        response.data.push(...(await getTaxTXs(wallet)));
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

// Function to get TXs for tax reporting:
const getTaxTXs = async (wallet) => {

  // Initializing Data:
  let taxTXs = [];
  let tokens = new Set();
  let dates = { start: 9999999999, formattedStart: '', end: 0, formattedEnd: '' }
  let tokenString = '';
  let tokenPrices = {};

  // Fetching TXs:
  let txs = await getTXs(chain, wallet);

  // Collecting Data From TXs:
  let promises = txs.map(tx => (async () => {
    if(!tokens.has(tx.token.address)) {
      tokens.add(tx.token.address);
    }
    if(tx.time < dates.start) {
      dates.start = tx.time;
    }
    if(tx.time > dates.end) {
      dates.end = tx.time;
    }
  })());
  await Promise.all(promises);

  // Formatting Data:
  let tokenArray = Array.from(tokens);
  tokenArray.forEach(token => {
    tokenString += token + ',';
  });
  tokenString = tokenString.slice(0, -1);
  dates.formattedStart = formatDate(dates.start);
  dates.formattedEnd = formatDate(dates.end);

  // Fetching Historical Token Prices:
  let response = (await axios.get(`https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${id}/USD/${tokenString}/?quote-currency=USD&format=JSON&from=${dates.formattedStart}&to=${dates.formattedEnd}&page-size=9999&prices-at-asc=true&key=${ckey}`)).data;
  if(!response.error) {
    response.data.forEach(token => {
      tokenPrices[token.contract_address] = [];
      token.prices.forEach(entry => {
        tokenPrices[token.contract_address].push({ time: (new Date(entry.date).getTime() / 1000), price: entry.price });
      });
    });
  }

  // Adding TX Token Prices:
  txs.forEach(tx => {
    let txDate = Math.max(...(tokenPrices[tx.token.address].filter(entry => entry.time < tx.time).map(i => i.time)));
    let foundEntry = tokenPrices[tx.token.address].find(entry => entry.time === txDate);
    if(foundEntry) {
      tx.token.price = foundEntry.price;
    } else {
      tx.token.price = 0;
    }
    taxTXs.push(tx);
  });

  return taxTXs;
}

// Function to format a date:
const formatDate = (rawDate) => {
  let date = new Date((rawDate * 1000));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Function to pad number if necessary:
const pad = (num) => {
  let str = num.toString();
  if(str.length < 2) {
    return '0' + str;
  } else {
    return str;
  }
}