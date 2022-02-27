
// Imports:
import { getTokens } from '../../terra-functions';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = () => {

  // Fetching Tokens:
  let response = getTokens();

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}