
// Imports:
import { Coin, Coins, Delegation, LCDClient } from '@terra-money/terra.js';
import { Pagination } from '@terra-money/terra.js/dist/client/lcd/APIRequester';
import { terra_data } from '../../tokens';
import { initResponse, query, addNativeToken, addToken } from '../../terra-functions';
import type { Request } from 'express';
import type { TerraAddress, Token, NativeToken } from 'cookietrack-types';

// Setting Up Blockchain Connection:
const terra = new LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

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

  // Initializations:
  let balances: NativeToken[] = [];
  let ignoreTokens = ['unok', 'uidr'];
  let bankBalances: Coin[] = [];
  let stakingDelegations: Delegation[] = [];
  let firstQuery = true;
  let pageKey: string | null = null;

  // Bank Balances:
  while(firstQuery || pageKey) {
    let results: [Coins, Pagination] = await terra.bank.balance(wallet, (pageKey ? { "pagination.key": pageKey } : undefined));
    pageKey = results[1].next_key;
    bankBalances.push(...results[0].filter((token: any) => token.denom.charAt(0) === 'u' && !ignoreTokens.includes(token.denom.toLowerCase())));
    firstQuery = false;
  }

  // LUNA Staking Delegations:
  firstQuery = true;
  pageKey = null;
  while (firstQuery || pageKey) {
    let results: [Delegation[], Pagination] = await terra.staking.delegations(wallet, undefined, (pageKey ? { "pagination.key": pageKey } : undefined));
    pageKey = results[1].next_key;
    stakingDelegations.push(...results[0]);
    firstQuery = false;
  }

  // Delegation Rewards:
  let rewards = (await terra.distribution.rewards(wallet)).total.filter(coin => coin.denom.charAt(0) === 'u' && !ignoreTokens.includes(coin.denom.toLowerCase()));
  
  // Adding Tokens:
  let promises = [
    ...bankBalances.map((token: Coin) => (async () => {
      balances.push(await addNativeToken('wallet', 'none', token.amount.toNumber(), wallet, token.denom.slice(1)));
    })()),
    ...stakingDelegations.map((delegation) => (async () => {
      balances.push(await addNativeToken('staking_luna', 'staked', delegation.balance.amount.toNumber(), wallet, delegation.balance.denom.slice(1)));
    })()),
    ...rewards.map((token: Coin) => (async () => {
      balances.push(await addNativeToken('staking_luna', 'unclaimed', token.amount.toNumber(), wallet, token.denom.slice(1)));
    })())
  ];
  await Promise.all(promises);
  return balances;
}

// Function to get token balances:
const getTokenBalances = async (wallet: TerraAddress) => {
  let tokens: Token[] = [];
  let promises = terra_data.tokens.map(token => (async () => {
    let balance = parseInt((await query(token.address, { balance: { address: wallet } })).balance);
    if(balance > 0) {
      let newToken = await addToken('wallet', 'none', token.address, token.symbol, token.decimals, balance, wallet);
      tokens.push(newToken);
    }
  })());
  await Promise.all(promises);
  return tokens;
}