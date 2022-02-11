
// Imports:
import { Coin, Coins, Delegation, LCDClient } from '@terra-money/terra.js';
import { terra_data } from '../../tokens';
import { initResponse, query, addNativeToken, addToken } from '../../terra-functions';
import type { Request } from 'express';
import type { TerraAddress, Token, NativeToken } from 'cookietrack-types';
import { Pagination } from '@terra-money/terra.js/dist/client/lcd/APIRequester';

// Setting Up Blockchain Connection:
const terra = new LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

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

  // Get bank balances
  const bankBalances: Coin[] = [];
  {
    let first_query = true;
    let page_key: string | null = null;
    while (first_query || page_key) {
      const results: [Coins, Pagination] = await terra.bank.balance(wallet, (page_key ? { "pagination.key": page_key } : undefined));
      page_key = results[1].next_key;
      bankBalances.push(...results[0].filter((token: any) => token.denom.charAt(0) === 'u' && !ignoreTokens.includes(token.denom.toLowerCase())));
      first_query = false;
    }
  }

  // Get LUNA staking delegations
  const stakingDelegations: Delegation[] = [];
  {
    let first_query = true;
    let page_key: string | null = null;
    while (first_query || page_key) {
      const results: [Delegation[], Pagination] = await terra.staking.delegations(wallet, undefined, (page_key ? { "pagination.key": page_key } : undefined));
      page_key = results[1].next_key;
      stakingDelegations.push(...results[0]);
      first_query = false;
    }
  }

  // Get Delegation Rewards
  const rewards = (await terra.distribution.rewards(wallet)).total.filter(coin => coin.denom.charAt(0) === 'u' && !ignoreTokens.includes(coin.denom.toLowerCase()));

  // Await adding tokens
  let promises = [
    ...bankBalances.map((token: Coin) => (async () => {
      balances.push(await addNativeToken('wallet', 'none', token.amount.toNumber(), wallet, token.denom.slice(1)));
    })()),
    ...stakingDelegations.map((delegation) => (async () => {
      balances.push(await addNativeToken('wallet', 'staked', delegation.balance.amount.toNumber(), wallet, delegation.balance.denom.slice(1)));
    })()),
    ...rewards.map((token: Coin) => (async () => {
      balances.push(await addNativeToken('wallet', 'unclaimed', token.amount.toNumber(), wallet, token.denom.slice(1)));
    })())
  ];
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