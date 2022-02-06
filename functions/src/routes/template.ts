
// Imports:
import { minABI } from '../ABIs'; // <TODO> Edit to include all the ABIs you need. Also change path to '../../ABIs'.
import { initResponse, query, addToken } from '../functions'; // <TODO> Edit to include all functions you need. Also change path to '../../functions'.
import type { Request } from 'express';
import type { Chain, Address } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'eth'; // <TODO> Edit to be the chain the route is dependent on.
const project = 'aave'; // <TODO> Edit to be the name of the dapp being added.
const aaveToken: Address = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'; // <TODO> Remove this example.
// <TODO> Initialize any other hard-coded addresses such as on-chain registries, token addresses, etc. (Example Above)

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getSomething(wallet))); // <TODO> Edit to include all data necessary in response. You can have multiples of these.
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

// Example function:
const getSomething = async (wallet: Address) => {
  let balance = parseInt(await query(chain, aaveToken, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let newToken = await addToken(chain, project, aaveToken, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}