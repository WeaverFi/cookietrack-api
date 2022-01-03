
// Imports:
const { query, addToken, isAddress } = require('../../static/terra-functions.js');

// Initializations:
const chain = 'terra';
const project = 'anchor';
const aust = 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu';

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
  let res = await query(async (terra) => {
    return await terra.wasm.contractQuery( aust, { balance: { address: wallet } });
  }, `getEarnBalance(${wallet})`);
  if(res.balance > 0) {
    let newToken = await addToken(chain, project, aust, 'aUST', 6, parseInt(res.balance), wallet);
    return [newToken];
  } else {
    return [];
  }
}
