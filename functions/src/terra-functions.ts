
// Imports:
import { Coin, LCDClient, AccPubKey } from '@terra-money/terra.js';
import axios from 'axios';

// Importing Types:
import type { Request } from 'express';
import type { APIResponse, Chain, TerraAddress, Address, URL, Token, NativeToken, TokenType, TokenStatus } from 'cookietrack-types';

// Importing Variables:
import { terra_data } from './tokens';

// Initializations:
const chain: Chain = 'terra';
const defaultTokenLogo: URL = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';
const defaultAddress: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const nativeTokenSymbols: string[] = ['aud', 'cad', 'chf', 'cny', 'dkk', 'eur', 'gbp', 'hkd', 'idr', 'inr', 'jpy', 'krw', 'mnt', 'php', 'sdr', 'sek', 'sgd', 'thb', 'usd', 'myr', 'twd'];
let terraTokenPrices: Map<Address | TerraAddress, number> = new Map();
let tokenPricesPromise: any;

// Setting Up Blockchain Connection:
const terra = new LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
export const query = async (address: TerraAddress, query: any): Promise<any> => {
  try {
    let result = await terra.wasm.contractQuery(address, query);
    return result;
  } catch {
    console.error(`Calling ${query} on ${address} (Chain: TERRA)`);
  }
};

/* ========================================================================================================================================================================= */

// Function to initialize generic API route response:
export const initResponse = (req: Request) => {
  let wallet = req.query.address as TerraAddress;
  let response: APIResponse = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }
  if(wallet != undefined) {
    if(!isAddress(wallet)) {
      response.status = 'error';
      response.data = [{error: 'Invalid Wallet Address'}];
    }
  } else {
    response.status = 'error';
    response.data = [{error: 'No Wallet Address in Request'}];
  }
  return response;
}

/* ========================================================================================================================================================================= */

// Function to check if an address is a valid Terra wallet address:
export const isAddress = (address: string) => {
  try {
    AccPubKey.fromAccAddress(address);
    return true;
  } catch {
    return false;
  }
};

/* ========================================================================================================================================================================= */

// Function to get native token info:
export const addNativeToken = async (location: string, status: TokenStatus, rawBalance: number, owner: TerraAddress, symbol: string): Promise<NativeToken> => {

  // Initializing Token Values:
  let type: TokenType = 'nativeToken';
  let address = defaultAddress;
  let balance = rawBalance / (10 ** 6);

  // Finding Token Price:
  let price = await getTokenPrice(defaultAddress, symbol);

  // Correcting Token Symbol:
  if(symbol != 'luna') {
    if(nativeTokenSymbols.includes(symbol)) {
      symbol = symbol.slice(0, -1) + 't';
    } else {
      console.error(`TERRA: Native Token Symbol Not Found - ${symbol}`);
    }
  }
  symbol = symbol.toUpperCase();

  // Finding Token Logo:
  let logo = getTokenLogo(symbol);

  return { type, chain, location, status, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get token info:
export const addToken = async (location: string, status: TokenStatus, address: TerraAddress, symbol: string, decimals: number, rawBalance: number, owner: TerraAddress): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let balance = rawBalance / (10 ** decimals);
  let price = await getTokenPrice(address);
  let logo = getTokenLogo(symbol);

  return { type, chain, location, status, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get tracked tokens:
export const getTokens = async () => {

  // Initializing Token Array:
  let tokens: { symbol: string, address: TerraAddress, logo: URL }[] = [];

  // Adding Tokens:
  terra_data.tokens.forEach(token => {
    tokens.push({
      symbol: token.symbol,
      address: token.address,
      logo: getTokenLogo(token.symbol)
    });
  });

  return tokens;
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
export const getTokenLogo = (symbol: string): URL => {

  // Initializing Token Logo Interface:
  interface TokenLogo { symbol: String, logo: URL };
  
  // Initializating Default Token Logo:
  let token: TokenLogo = { symbol: '', logo: defaultTokenLogo };

  // Finding Token Logo:
  let foundToken: TokenLogo | undefined = terra_data.logos.find((token: TokenLogo) => token.symbol === symbol);
  if(foundToken) { token = foundToken; }

  return token.logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
export const getTokenPrice = async (address: Address | TerraAddress, symbol?: string) => {
  try {

    // Getting Price Data (Runs Once):
    if(terraTokenPrices.size === 0) {
      await fetchInitialTokenPrices();
    }

    // Finding Token Price in Data:
    let tokenAddress = (address + (symbol ?? '')).toLowerCase() as Address | TerraAddress;
    let tokenPrice = terraTokenPrices.get(tokenAddress);
    if(tokenPrice) {
      return tokenPrice;
    } else {
      console.error(`TERRA: Token Price Not Found - ${address}${symbol ?? ''}`);
      return 0;
    }
  } catch {
    return 0;
  }
}

/* ========================================================================================================================================================================= */

// Function to initialize token prices:
const fetchInitialTokenPrices = async () => {
  if(!tokenPricesPromise) {
    tokenPricesPromise = (async () => {
      try {

        // LUNA:
        let terraQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terra-luna&vs_currencies=usd';
        let terraPrice = (await axios.get(terraQuery)).data['terra-luna'].usd;
        terraTokenPrices.set(defaultAddress + 'luna' as Address, terraPrice);

        // UST:
        let ustQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terrausd&vs_currencies=usd';
        let ustPrice = (await axios.get(ustQuery)).data['terrausd'].usd;
        terraTokenPrices.set(defaultAddress + 'usd' as Address, ustPrice);

        // Other Native Tokens:
        let nativeTokens = (await terra.bank.total())[0];
        let ignoreTokens = ['uluna', 'uusd', 'unok', 'uidr'];
        let peggedAssets = nativeTokens.filter((asset: Coin) => asset.denom.charAt(0) === 'u' && !ignoreTokens.includes(asset.denom.toLowerCase()));
        await Promise.all(peggedAssets.map((asset: Coin) => {
          let singleUnitAsset = new Coin(asset.denom, 10 ** 6);
          return new Promise<void>(async (resolve, reject) => {
            try {
              let ulunaRate = (await terra.market.swapRate(singleUnitAsset, 'uluna')).amount.toNumber() / (10 ** 6);
              let usdRate = ulunaRate * terraPrice;
              terraTokenPrices.set(defaultAddress + singleUnitAsset.denom.slice(1) as Address, usdRate);
              resolve();
            } catch {
              console.error(`TERRA: Native Token Price Not Found - ${singleUnitAsset.denom}`);
              resolve();
            }
          });
        }));

        // Other Tokens:
        let tokenList = '';
        terra_data.tokens.forEach((token: { address: TerraAddress, symbol: string }) => {
          tokenList += token.address + ',';
        });
        let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/terra?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
        let result = await axios.get(apiQuery);
        let tokens = Object.keys(result.data);
        tokens.forEach(token => {
          terraTokenPrices.set(token.toLowerCase() as TerraAddress, result.data[token].usd);
        });
      } catch {
        console.error(`TERRA: Could not initialize token prices.`);
      }
    })();
  }
  await tokenPricesPromise;
};