
// Imports:
import { minABI } from '../../ABIs';
import { initResponse, query, addToken } from '../../functions';
import { query as queryTerra } from '../../terra-functions';
import type { Request } from 'express';
import type { Chain, Address, TerraAddress } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'avax';
const project = 'anchor';
const aust: Address = '0xaB9A04808167C170A9EC4f8a87a0cD781ebcd55e';
const ust: Address = '0xb599c3590F42f8F995ECfa0f85D2980B76862fc1';
const market: TerraAddress = 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
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
const getEarnBalance = async (wallet: Address) => {
  let balance = parseInt(await query(chain, aust, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let exchangeRate = (await queryTerra(market, {state: {}})).prev_exchange_rate;
    let newToken = await addToken(chain, project, 'staked', ust, balance * exchangeRate, wallet);
    return [newToken];
  } else {
    return [];
  }
}