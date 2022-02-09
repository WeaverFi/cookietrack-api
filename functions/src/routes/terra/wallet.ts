
// Imports:
const Terra = require('@terra-money/terra.js');
import { terra_data } from '../../tokens';
import { initResponse, query, addNativeToken, addToken } from '../../terra-functions';
import type { Request } from 'express';
import type { TerraAddress, Token, NativeToken } from 'cookietrack-types';

// Setting Up Blockchain Connection:
const terra = new Terra.LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as TerraAddress;
      response.data.push(...(await getNativeBalances(wallet)));
      response.data.push(...(await getTokenBalances(wallet)));
    } catch(err: any) {
      console.error(err);
      response.status = 'error';
      response.data = [{error: 'Internal API Error'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get native wallet balance:
const getNativeBalances = async (wallet: TerraAddress) => {
  let balances: NativeToken[] = [];
  let ignoreTokens = ['unok', 'uidr'];
  let bankBalances = (await terra.bank.balance(wallet))[0].filter((token: any) => token.denom.charAt(0) === 'u' && !ignoreTokens.includes(token.denom.toLowerCase()));
  let promises = bankBalances.map((token: any) => (async () => {
    let newToken = await addNativeToken('wallet', 'none', token.amount, wallet, token.denom.slice(1));
    balances.push(newToken);
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get token balances:
const getTokenBalances = async (wallet: TerraAddress) => {
  let tokens: Token[] = [];
  let promises = terra_data.tokens.map((token: { address: TerraAddress, symbol: string }) => (async () => {
    let balance = parseInt((await query(token.address, {balance: {address: wallet}})).balance);
    if(balance > 0) {
      let decimals = (await query(token.address, {token_info: {}})).decimals;
      let newToken = await addToken('wallet', 'none', token.address, token.symbol, decimals, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}