
// Imports:
const { query, addToken } = require('../../static/terra-functions.js');

// Initializations:
const chain = "terra";
const project = "anchor";
const aUST = "terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu";

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
      response.data.push(...(await getAnchorEarnBalance(wallet)));
    } catch {
      response.status = 'error';
      response.data = [{ error: 'Internal API Error' }];
    }
  } else {
    response.status = 'error';
    response.data = [{ error: 'No Wallet Address in Request' }];
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get anchor earn aUST balance:
const getAnchorEarnBalance = async (wallet) => {
  try {
    const res = await query(async (terra) => {
      return await terra.wasm.contractQuery(aUST, {
        balance: {
          address: wallet
        },
      })
    }, `Get aUST Balance for: ${wallet}`);
    return [await addToken(chain, project, aUST, 'aUST', 6, parseInt(res.balance), wallet)];
  } catch {
    return [];
  }
}
