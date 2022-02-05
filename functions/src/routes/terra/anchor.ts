
// Imports:
import { initResponse, query, addNativeToken } from '../../terra-functions';
import type { Request } from 'express';
import type { TerraAddress, NativeToken } from 'cookietrack-types';

// Initializations:
const project = 'anchor';
const aust: TerraAddress = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu';
const market: TerraAddress = 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as TerraAddress;
      response.data.push(...(await getEarnBalance(wallet)));
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

// Function to get Earn aUST balance:
const getEarnBalance = async (wallet: TerraAddress): Promise<NativeToken[]> => {
  let balance = parseInt((await query(aust, {balance: {address: wallet}})).balance);
  if(balance > 0) {
    let exchangeRate = (await query(market, {state: {}})).prev_exchange_rate;
    let newToken = await addNativeToken(project, balance * exchangeRate, wallet, 'usd');
    return [newToken];
  } else {
    return [];
  }
}
