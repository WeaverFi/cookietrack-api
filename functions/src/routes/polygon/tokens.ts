
// Imports:
import { getTokens } from '../../functions';
import type { Request } from 'express';
import type { Chain } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'poly';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Fetching Tokens:
  let response = await getTokens(chain);

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}