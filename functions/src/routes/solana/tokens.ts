
// Imports:
import { getTokens } from '../../sol-functions';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async () => {

  // Fetching Tokens:
  let response = await getTokens();

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}