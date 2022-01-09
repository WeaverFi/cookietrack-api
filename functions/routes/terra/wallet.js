
// Imports:
const { isAddress, query, addNativeToken, addToken } = require('../../static/terra-functions.js');
const { terra_tokens } = require('../../static/tokens/terra.js');
const Terra = require('@terra-money/terra.js');

// Initializations:
const chain = 'terra';

// Setting Up Blockchain Connection:
const terra = new Terra.LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

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
        response.data.push(...(await getTokenBalances(wallet)));
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

// Function to get native wallet balance:
const getNativeBalances = async (wallet) => {
  let balances = [];
  let ignoreTokens = ['unok', 'uidr'];
  let bankBalances = (await terra.bank.balance(wallet))[0].filter(token => token.denom.charAt(0) === 'u' && !ignoreTokens.includes(token.denom.toLowerCase()));
  let promises = bankBalances.map(token => (async () => {
    let newToken = await addNativeToken(chain, 'wallet', token.amount, wallet, token.denom.slice(1));
    balances.push(newToken);
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get token balances:
const getTokenBalances = async (wallet) => {
  let tokens = [];
  let promises = terra_tokens.map(token => (async () => {
    let balance = parseInt((await query(token.address, {balance: {address: wallet}})).balance);
    if(balance > 0) {
      let decimals = (await query(token.address, {token_info: {}})).decimals;
      let newToken = await addToken(chain, 'wallet', token.address, token.symbol, decimals, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}