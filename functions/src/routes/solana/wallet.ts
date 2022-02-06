
// Imports:
const web3 = require('@solana/web3.js');
import axios from 'axios';
import { sol_data } from '../../tokens';
import { initResponse, isAddress, query, addNativeToken, addToken } from '../../sol-functions';
import type { Request } from 'express';
import type { SolAddress, Token } from 'cookietrack-types';
const keys: Record<string, string> = require('../../../static/keys.json');

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    let wallet = req.query.address as SolAddress;
    let walletCheck = await isAddress(wallet);
    if(walletCheck[0]) {
      try {
        response.data.push(...(await getSOL(wallet, walletCheck[1])));
        if(walletCheck[1] === 0) {
          response.data.push(...(await getTokenBalances(wallet)));
        }
      } catch(err: any) {
        console.error(err);
        response.status = 'error';
        response.data = [{error: 'Internal API Error'}];
      }
    } else {
      response.status = 'error';
      response.data = [{error: 'Invalid Wallet Address'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get native wallet balance:
const getSOL = async (wallet: SolAddress, type: 0 | 1) => {
  let balance = await query('getBalance', [new web3.PublicKey(wallet)]);
  if(balance > 0) {

    // Staking Wallet:
    if(type === 1) {
      let newToken = await addToken('staking_sol', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'SOL', 9, balance, wallet);
      return [newToken];

    // Standard Wallet:
    } else {
      let newToken = await addNativeToken(balance, wallet);
      return [newToken];
    }
  } else {
    return [];
  }
}

// Function to get token balances:
const getTokenBalances = async (wallet: SolAddress) => {
  let tokens: Token[] = [];
  let apiQuery = 'https://api.solanabeach.io/v1/account/' + wallet + '/tokens';
  let apiTokens;
  let errors = 0;
  while(!apiTokens && errors < 3) {
    try {
      apiTokens = (await axios.get(apiQuery, { headers: { 'Authorization': `Bearer ${keys.beachKey}` }})).data;
      let promises = apiTokens.map((token: any) => (async () => {
        if(token.amount > 0) {
          let sol_token = sol_data.tokens.find((i: { address: SolAddress, symbol: string }) => i.address.toLowerCase() === token.mint.address.toLowerCase());
          if(sol_token) {
            let newToken = await addToken('wallet', sol_token.address, sol_token.symbol, token.decimals, token.amount, wallet);
            tokens.push(newToken);
          }
        }
      })());
      await Promise.all(promises);
    } catch(err: any) {
      if(++errors > 2) {
        console.error(`SolanaBeach API Error: ${err.response.status}`);
      }
    }
  }
  return tokens;
}