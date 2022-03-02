
// Imports:
import { initResponse, getTaxTXs } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'bsc';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getTaxTXs(chain, wallet)));
    } catch(err: any) {
      console.error(err);
      response.status = 'error';
      response.data = [{error: 'Internal API Error'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}