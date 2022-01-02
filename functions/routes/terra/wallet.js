
// Imports:
const { query, addNativeToken } = require('../../static/terra-functions.js');

// Initializations:
const chain = "TERRA";

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
  if (wallet != undefined) {
    try {
      response.data.push(...(await getNativeBalances(wallet)));
    } catch {
      response.status = 'error';
      response.data = [{ error: 'Internal API Error' }];
    }
  } else {
    response.status = 'error';
    response.data = [{ error: 'No Wallet Address in Request' }];
  }

  // Returning Response:
  return JSON.stringify(response);
}

/* ========================================================================================================================================================================= */

// Function to get native wallet balance:
const getNativeBalances = async (wallet) => {
  try {
    const res = await query(async (terra) => {
      return await terra.bank.balance(wallet);
    }, `Get Native Balances for: ${wallet}`);
    const balances = await Promise.all(res[0].filter(coin => coin.denom.charAt(0) == 'u').map(coin => addNativeToken(chain, coin.amount, wallet, coin.denom.slice(1).toUpperCase())));
    return balances;
  } catch {
    return [];
  }
}