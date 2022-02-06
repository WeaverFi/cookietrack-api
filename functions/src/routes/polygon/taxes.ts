
// Imports:
import { initResponse, getTXs, getTokenPriceHistories } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address, TaxTransferTX, TaxApprovalTX } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'poly';
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
const getTaxTXs = async (wallet: Address) => {

  // Initializing Data:
  let taxTXs: (TaxTransferTX | TaxApprovalTX)[] = [];
  let tokens: Set<Address> = new Set();
  let dates = { start: 9999999999, end: 0 }

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

  // Fetching Token Price Histories:
  let tokenPrices = await getTokenPriceHistories(chain, tokens, dates);

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