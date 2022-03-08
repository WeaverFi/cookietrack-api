
// Required Packages:
const web3 = require('@solana/web3.js');
import axios from 'axios';

// Importing Types:
import type { Request } from 'express';
import type { APIResponse, Chain, SolAddress, Address, URL, Token, NativeToken, TokenType, TokenStatus } from 'cookietrack-types';

// Importing Variables:
import { sol_data } from './tokens';

// Initializations:
const chain: Chain = 'sol';
const defaultTokenLogo: URL = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';
const defaultAddress: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
let solTokenPrices: { token: Address | SolAddress, price: number }[] = [];

// Setting Up Web3 Connection:
const sol = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
export const query = async (method: string, args: any[]) => {
  try {
    let result = await sol[method](...args);
    return result;
  } catch {
    console.error(`Calling ${method}(${args}) (Chain: SOL)`);
  }
}

/* ========================================================================================================================================================================= */

// Function to check if an address is a valid Solana wallet address:
export const isAddress = async (address: string) => {
  let data: [boolean, 0 | 1] = [false, 0];
  try {
    let wallet = new web3.PublicKey(address);
    let info = await query('getParsedAccountInfo', [wallet]);
    if(info) {
      if(info.value != null) {
        let owner = info.value.owner.toBase58();
        if(owner.endsWith('11111111111111111111111111111111')) {
          data[0] = true;
        }
        if(owner.startsWith('Stake')) {
          data[1] = 1;
        }
      }
    }
    return data;
  } catch {
    return data;
  }
}

/* ========================================================================================================================================================================= */

// Function to initialize generic API route response:
export const initResponse = (req: Request) => {
  let wallet = req.query.address as SolAddress;
  let response: APIResponse = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }
  if(wallet == undefined) {
    response.status = 'error';
    response.data = [{error: 'No Wallet Address in Request'}];
  }
  return response;
}

/* ========================================================================================================================================================================= */

// Function to get native token info:
export const addNativeToken = async (rawBalance: number, owner: SolAddress): Promise<NativeToken> => {

  // Initializing Token Values:
  let type: TokenType = 'nativeToken';
  let location = 'wallet';
  let status: TokenStatus = 'none';
  let address = defaultAddress;
  let balance = rawBalance / (10 ** 9);
  let price = await getTokenPrice(defaultAddress);
  let symbol = 'SOL';
  let logo = getTokenLogo(symbol);

  return { type, chain, location, status, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get token info:
export const addToken = async (location: string, status: TokenStatus, address: SolAddress, symbol: string, decimals: number, rawBalance: number, owner: SolAddress): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let balance = rawBalance / (10 ** decimals);
  let price = await getTokenPrice(address);
  let logo = getTokenLogo(symbol);

  return { type, chain, location, status, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get tracked tokens:
export const getTokens = () => {
  return sol_data.tokens;
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
const getTokenLogo = (symbol: string) => {

  // Initializing Default Token Logo:
  let logo = defaultTokenLogo;

  // Finding Token Logo:
  let trackedToken = sol_data.tokens.find(token => token.symbol === symbol);
  if(trackedToken) {
    logo = trackedToken.logo;
  } else {
    let token = sol_data.logos.find(i => i.symbol === symbol);
    if(token) {
      logo = token.logo;
    }
  }

  return logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
export const getTokenPrice = async (address: SolAddress) => {
  try {

    // Getting Price Data (Runs Once):
    if(solTokenPrices.length === 0) {
      let tokenList = '';
      sol_data.tokens.forEach((token: { address: SolAddress, symbol: string }) => {
        tokenList += token.address + ',';
      });
      let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
      let solQuery = 'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
      try {
        let solResult = await axios.get(solQuery);
        solTokenPrices.push({token: defaultAddress, price: solResult.data.market_data.current_price.usd});
        let result = await axios.get(apiQuery);
        let tokens = Object.keys(result.data);
        tokens.forEach(token => {
          solTokenPrices.push({token: token.toLowerCase(), price: result.data[token].usd});
        });
      } catch {
        return 0;
      }
    }

    // Finding Token Price in Data:
    let token = solTokenPrices.find(i => i.token === address.toLowerCase());
    if(token) {
      return token.price;
    } else {
      if(address.toLowerCase() === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'.toLowerCase()) { // USDC
        return 1;
      } else if(address.toLowerCase() === 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW'.toLowerCase()) { // WUSDC
        return 1;
      } else if(address.toLowerCase() === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'.toLowerCase()) { // USDT
        return 1;
      } else if(address.toLowerCase() === 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4'.toLowerCase()) { // WUSDT
        return 1;
      } else {
        return 0;
      }
    }
  } catch {
    return 0;
  }
}