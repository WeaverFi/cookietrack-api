
// Imports:
import { getTokens } from '../../functions';
import type { Chain } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'one';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async () => {

  // Fetching Tokens:
  let response = await getTokens(chain);

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}