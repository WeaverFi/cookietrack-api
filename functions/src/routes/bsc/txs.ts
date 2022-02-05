
// Imports:
import { initResponse, getTXs } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'bsc';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      req.query.hasOwnProperty('last50') ? response.data.push(...(await getTXs(chain, wallet, true))) : response.data.push(...(await getTXs(chain, wallet)));
    } catch(err: any) {
      console.error(err);
      response.status = 'error';
      response.data = [{error: 'Internal API Error'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}