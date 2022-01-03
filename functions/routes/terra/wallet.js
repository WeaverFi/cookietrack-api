
// Imports:
const { query, addNativeToken, isAddress } = require('../../static/terra-functions.js');

// Initializations:
const chain = 'terra';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req) => {

  // Initializing Response:
  let response = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }

  // Getting Wallet Address:
  const wallet = req.query.address;

  // Checking Parameters:
  if(wallet != undefined) {
    if(isAddress(wallet)) {
      try {
        response.data.push(...(await getNativeBalances(wallet)));
      } catch {
        response.status = 'error';
        response.data = [{ error: 'Internal API Error' }];
      }
    } else {
      response.status = 'error';
      response.data = [{error: 'Invalid Wallet Address'}];
    }
  } else {
    response.status = 'error';
    response.data = [{ error: 'No Wallet Address in Request' }];
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get native wallet balance:
const getNativeBalances = async (wallet) => {
  try {
    let res = await query(async (terra) => {
      return await terra.bank.balance(wallet);
    }, `getNativeBalances(${wallet})`);
    let balances = await Promise.all(res[0].filter(token => token.denom.charAt(0) == 'u').map(token => addNativeToken(chain, token.amount, wallet, token.denom.slice(1).toUpperCase())));
    return balances;
  } catch {
    return [];
  }
}
