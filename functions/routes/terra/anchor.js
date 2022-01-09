
// Imports:
const { isAddress, query, addNativeToken, addToken } = require('../../static/terra-functions.js');

// Initializations:
const chain = 'terra';
const project = 'anchor';
const aust = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu';
const market = 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s';

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
        response.data.push(...(await getEarnBalance(wallet)));
      } catch {
        response.status = 'error';
        response.data = [{ error: 'Internal API Error' }];
      }
    } else {
      response.status = 'error';
      response.data = [{ error: 'Invalid Wallet Address' }];
    }
  } else {
    response.status = 'error';
    response.data = [{ error: 'No Wallet Address in Request' }];
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get Earn aUST balance:
const getEarnBalance = async (wallet) => {
  let balance = parseInt((await query(aust, {balance: {address: wallet}})).balance);
  if(balance > 0) {
    let exchangeRate = (await query(market, {state: {}})).prev_exchange_rate;
    let newToken = await addNativeToken(chain, project, balance * exchangeRate, wallet, 'usd');
    return [newToken];
  } else {
    return [];
  }
}
