
// Imports:
import axios from 'axios';
import { initResponse, getTXs } from '../../functions';
import type { Request } from 'express';
import type { Chain, ChainID, Address, TaxTransferTX, TaxApprovalTX } from 'cookietrack-types';
const keys: Record<string, string> = require('../../../static/keys.json');

// Initializations:
const chain: Chain = 'eth';
const id: ChainID = 1;
const nativeToken: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getTaxTXs(wallet)));
    } catch(err: any) {
      console.error(err);
      response.status = 'error';
      response.data = [{error: 'Internal API Error'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get TXs for tax reporting:
const getTaxTXs = async (wallet: Address): Promise<(TaxTransferTX | TaxApprovalTX)[]> => {

  // Initializing Data:
  let taxTXs: (TaxTransferTX | TaxApprovalTX)[] = [];
  let tokens = new Set();
  let dates = { start: 9999999999, formattedStart: '', end: 0, formattedEnd: '' }
  let tokenString = '';
  let tokenPrices: Record<Address, any[]> = {};

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

  // Adding Native Token:
  if(!tokens.has(nativeToken)) {
    tokens.add(nativeToken);
  }

  // Formatting Data:
  let tokenArray = Array.from(tokens);
  tokenArray.forEach(token => {
    tokenString += token + ',';
  });
  tokenString = tokenString.slice(0, -1);
  dates.formattedStart = formatDate(dates.start);
  dates.formattedEnd = formatDate(dates.end);

  // Fetching Historical Token Prices:
  let response = (await axios.get(`https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/${id}/USD/${tokenString}/?quote-currency=USD&format=JSON&from=${dates.formattedStart}&to=${dates.formattedEnd}&page-size=9999&prices-at-asc=true&key=${keys.ckey}`)).data;
  if(!response.error) {
    response.data.forEach((token: any) => {
      tokenPrices[token.contract_address] = [];
      token.prices.forEach((entry: any) => {
        tokenPrices[token.contract_address].push({ time: (new Date(entry.date).getTime() / 1000), price: entry.price });
      });
    });
  }

  // Adding TX Token Prices:
  txs.forEach((tx: any) => {

    // Token:
    if(tokenPrices[tx.token.address].length > 0) {
      let txDate = Math.max(...(tokenPrices[tx.token.address].filter(entry => entry.time < tx.time).map(i => i.time)));
      let foundEntry = tokenPrices[tx.token.address].find(entry => entry.time === txDate);
      foundEntry ? tx.token.price = foundEntry.price : tx.token.price = 0;
    } else {
      tx.token.price = 0;
    }

    // Native Token:
    if(tokenPrices[nativeToken].length > 0) {
      let txDate = Math.max(...(tokenPrices[nativeToken].filter(entry => entry.time < tx.time).map(i => i.time)));
      let foundEntry = tokenPrices[nativeToken].find(entry => entry.time === txDate);
      foundEntry ? tx.nativeTokenPrice = foundEntry.price : tx.nativeTokenPrice = 0;
    } else {
      tx.nativeTokenPrice = 0;
    }

    taxTXs.push(tx);
  });

  return taxTXs;
}

// Function to format a date:
const formatDate = (rawDate: number): string => {
  let date = new Date((rawDate * 1000));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Function to pad number if necessary:
const pad = (num: number): string => {
  let str = num.toString();
  if(str.length < 2) {
    return '0' + str;
  } else {
    return str;
  }
}