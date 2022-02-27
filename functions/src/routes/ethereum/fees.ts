
// Imports:
import { initResponse, getSimpleTXs, getTokenPrice } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'eth';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getFees(wallet)));
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

// Function to get transaction fees' info:
const getFees = async (wallet: Address) => {

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