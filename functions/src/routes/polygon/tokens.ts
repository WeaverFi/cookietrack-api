
// Imports:
import { getTokens } from '../../functions';
import type { Chain } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'poly';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = () => {

  // Fetching Tokens:
  let response = getTokens(chain);

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}