
// Imports:
import { getTokens } from '../../sol-functions';
import type { Request } from 'express';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Fetching Tokens:
  let response = await getTokens();

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}