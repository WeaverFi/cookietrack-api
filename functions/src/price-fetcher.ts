
// // Imports:
// import { getTokens } from './functions';
// import axios from 'axios';

// // Importing Types:
// import type { Chain, Address, ChainData, URL } from 'cookietrack-types';

// // Fetching Required JSON File:
// const chains: Record<Chain, ChainData> = require('../static/chains.json');

// /* ========================================================================================================================================================================= */

// // Price Fetching Function:
// export const fetchPrices = async (): Promise<void> => {
//   // <TODO>
// }

// /* ========================================================================================================================================================================= */

// // Test Price Fetching Function:
// export const testFetchPrices = async () => {
//   let response: any[] = [];
//   // <TODO>
//   return JSON.stringify(response, null, ' ');
// }

// /* ========================================================================================================================================================================= */

// // Function to query token prices for any given chain:
// const getTokenPrices = async (chain: Chain) => {

//   // Initializations:
//   let tokenPrices: { address: Address, symbol: string, price: number }[] = [];
//   let tokenList = '';
//   let unpricedTokens: Set<Address> = new Set();

//   // Creating & Formatting Token Lists:
//   let trackedTokens = getTokens(chain);
//   trackedTokens.forEach(token => {
//     tokenList += token.address + ',';
//     unpricedTokens.add(token.address);
//   });
//   tokenList = tokenList.slice(0, -1);

//   // Fetching CoinGecko Prices:
//   try {
//     let apiQuery = `https://api.coingecko.com/api/v3/simple/token_price/${chains[chain].cgID}?contract_addresses=${tokenList}&vs_currencies=usd`;
//     let response = (await axios.get(apiQuery)).data;
//     let tokens = Object.keys(response);
//     tokens.forEach(token => {
//       let address = token.toLowerCase() as Address;
//       let symbol = getTokenSymbol(trackedTokens, address);
//       let price = response[token].usd;
//       tokenPrices.push({ address, symbol, price });
//       unpricedTokens.delete(address);
//     });
//   } catch {
//     console.error(`PriceFetcher Error: CoinGecko ${chain.toUpperCase()} query failed.`);
//   }

//   // Fetching 1Inch Prices:
//   if(unpricedTokens.size > 0 && chains[chain].inch) {
//     for(const token of unpricedTokens) {
//       let price;
//       if(token === chains[chain].usdc) {
//         price = 1;
//       } else {
//         try {
//           let apiQuery = `https://api.1inch.exchange/v4.0/${chains[chain].id}/quote?fromTokenAddress=${token}&toTokenAddress=${chains[chain].usdc}&amount=${10 ** decimals}`;
//           let response = (await axios.get(apiQuery)).data;
//           if(response.protocols.length < 4) {
//             price = response.toTokenAmount / (10 ** chains[chain].usdcDecimals);
//           }
//         } catch {
//           console.error(`PriceFetcher Error: 1Inch ${chain.toUpperCase()} query failed.`);
//         }
//       }
//       if(price) {
//         let address = token;
//         let symbol = getTokenSymbol(trackedTokens, address);
//         tokenPrices.push({ address, symbol, price });
//         unpricedTokens.delete(address);
//       }
//     }
//   }

//   // Fetching ParaSwap Prices:
//   if(unpricedTokens.size > 0 && chains[chain].paraswap) {
//     for(const token of unpricedTokens) {
//       let price;
//       if(token === chains[chain].usdc) {
//         price = 1;
//       } else {
//         try {
//           let apiQuery = `https://apiv5.paraswap.io/prices?srcToken=${token}&srcDecimals=${decimals}&destToken=${chains[chain].usdc}&destDecimals=${chains[chain].usdcDecimals}&amount=${10 ** decimals}&side=SELL&network=${chains[chain].id}`;
//           let response = (await axios.get(apiQuery)).data;
//           let results = Object.keys(response);
//           if(results.length != 0) {
//             price = response[results[0]].destAmount / (10 ** chains[chain].usdcDecimals);
//           }
//         } catch {
//           console.error(`PriceFetcher Error: ParaSwap ${chain.toUpperCase()} query failed.`);
//         }
//       }
//     }
//   }

//   // Unpriced Tokens Alert:
//   // <TODO>

//   return tokenPrices;
// }

// // Function to fetch a tracked token's symbol:
// const getTokenSymbol = (tokens: { symbol: string, address: Address, logo: URL }[], address: Address) => {
//   let symbol = '???';
//   let token = tokens.find(i => i.address === address);
//   if(token) {
//     symbol = token.symbol;
//   }
//   return symbol;
// }