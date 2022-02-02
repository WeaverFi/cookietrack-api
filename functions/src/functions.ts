
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Importing Types:
import type { Request } from 'express';
import type { APIResponse, Chain, ChainData, Address, Hash, ABI, URL, Token, NativeToken, LPToken, PricedToken, DebtToken, TokenType, TransferTX, ApprovalTX, SimpleTX } from 'cookietrack-types';

// Fetching Required JSON Files:
const chains: Record<Chain, ChainData> = require('../static/chains.json');
const rpcs: Record<Chain, URL[]> = require('../static/rpcs.json');
const keys: Record<string, string> = require('../static/keys.json');

// Importing Variables:
import { minABI, lpABI, aave, balancer, snowball, traderjoe, belt, alpaca, curve, bzx, iron, axial, mstable } from './ABIs';
import { eth_data, bsc_data, poly_data, ftm_data, avax_data, one_data } from './tokens';

// Initializations:
const defaultTokenLogo: URL = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';
const defaultAddress: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const zero: Address = '0x0000000000000000000000000000000000000000';
const ignoreErrors: { chain: Chain, address: Address }[] = [
  {chain: 'poly', address: '0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed'}, // QuickSwap Registry
  {chain: 'poly', address: '0x9dd12421c637689c3fc6e661c9e2f02c2f61b3eb'}  // QuickSwap Dual Rewards Registry
];

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
export const query = async (chain: Chain, address: Address, abi: ABI[], method: string, args: any[]): Promise<any> => {
  let result;
  let errors = 0;
  while(!result && errors < 3) {
    try {
      let ethers_provider = new ethers.providers.JsonRpcProvider(rpcs[chain][0]);
      let contract = new ethers.Contract(address, abi, ethers_provider);
      result = await contract[method](...args);
    } catch {
      if(!ignoreErrors.find(i => i.chain === chain && i.address === address.toLowerCase())) {
        try {
          let ethers_provider = new ethers.providers.JsonRpcProvider(rpcs[chain][1]);
          let contract = new ethers.Contract(address, abi, ethers_provider);
          result = await contract[method](...args);
        } catch {
          if(++errors > 2) {
            console.error(`Calling ${method}(${args}) on ${address} (Chain: ${chain.toUpperCase()})`);
          }
        }
      } else {
        errors = 3;
      }
    }
  }
  return result;
}

/* ========================================================================================================================================================================= */

// Function to initialize generic API route response:
export const initResponse = (req: Request): APIResponse => {
  let wallet = req.query.address as Address;
  let response: APIResponse = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }
  if(wallet != undefined) {
    if(!ethers.utils.isAddress(wallet)) {
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

// Function to get native token info:
export const addNativeToken = async (chain: Chain, rawBalance: number, owner: Address): Promise<NativeToken> => {

  // Initializing Token Values:
  let type: TokenType = 'nativeToken';
  let location = 'wallet';
  let address = defaultAddress;
  let balance = rawBalance / (10 ** 18);
  let price = await getTokenPrice(chain, defaultAddress, 18);
  let symbol = '';

  // Finding Token Symbol:
  if(chain === 'bsc') {
    symbol = 'BNB';
  } else if(chain === 'poly') {
    symbol = 'MATIC';
  } else {
    symbol = chain.toUpperCase();
  }

  // Finding Token Logo:
  let logo = getTokenLogo(chain, symbol);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get token info:
export const addToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = '';
  let decimals = 18;

  // Finding Token Symbol:
  if(address.toLowerCase() === defaultAddress) {
    if(chain === 'bsc') {
      symbol = 'BNB';
    } else if(chain === 'poly') {
      symbol = 'MATIC';
    } else {
      symbol = chain.toUpperCase();
    }
  } else {
    symbol = await query(chain, address, minABI, 'symbol', []);
    decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  }

  // Finding Missing Token Info:
  let logo = getTokenLogo(chain, symbol);
  let balance = rawBalance / (10 ** decimals);
  let price = await getTokenPrice(chain, address, decimals);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get LP token info:
export const addLPToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<LPToken> => {

  // Initializing Token Values:
  let type: TokenType = 'lpToken';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);

  // Finding LP Token Info:
  let lpTokenReserves = await query(chain, address, lpABI, 'getReserves', []);
  let lpTokenSupply = await query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
  let supply0 = lpTokenReserves[0] / (10 ** decimals);
  let supply1 = lpTokenReserves[1] / (10 ** decimals);
  let address0 = await query(chain, address, lpABI, 'token0', []);
  let address1 = await query(chain, address, lpABI, 'token1', []);
  let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
  let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
  let symbol0 = await query(chain, address0, minABI, 'symbol', []);
  let symbol1 = await query(chain, address1, minABI, 'symbol', []);

  // First Paired Token:
  let token0: PricedToken = {
    symbol: symbol0,
    address: address0,
    balance: (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0),
    price: await getTokenPrice(chain, address0, decimals0),
    logo: getTokenLogo(chain, symbol0)
  }

  // Second Paired Token:
  let token1: PricedToken = {
    symbol: symbol1,
    address: address1,
    balance: (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1),
    price: await getTokenPrice(chain, address1, decimals1),
    logo: getTokenLogo(chain, symbol1)
  }

  return { type, chain, location, owner, symbol, address, balance, token0, token1 };
}

/* ========================================================================================================================================================================= */

// Function to get debt token info:
export const addDebtToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<DebtToken> => {

  // Initializing Token Values:
  let type: TokenType = 'debt';
  let symbol = '';
  let decimals = 18;

  // Finding Token Symbol:
  if(address.toLowerCase() === defaultAddress) {
    if(chain === 'bsc') {
      symbol = 'BNB';
    } else if(chain === 'poly') {
      symbol = 'MATIC';
    } else {
      symbol = chain.toUpperCase();
    }
  } else {
    symbol = await query(chain, address, minABI, 'symbol', []);
    decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  }

  // Finding Missing Token Info:
  let logo = getTokenLogo(chain, symbol);
  let balance = rawBalance / (10 ** decimals);
  let price = await getTokenPrice(chain, address, decimals);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
export const getTokenLogo = (chain: Chain, symbol: string): URL => {

  // Initializing Token Logo Interface:
  interface TokenLogo { symbol: string, logo: URL };

  // Initializating Default Token Logo:
  let token: TokenLogo = { symbol: '', logo: defaultTokenLogo };

  // Finding Token Logo:
  let foundToken: TokenLogo | undefined;
  if(chain === 'eth') {
    foundToken = eth_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  } else if(chain === 'bsc') {
    foundToken = bsc_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  } else if(chain === 'poly') {
    foundToken = poly_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  } else if(chain === 'ftm') {
    foundToken = ftm_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  } else if(chain === 'avax') {
    foundToken = avax_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  } else if(chain === 'one') {
    foundToken = one_data.logos.find((token: TokenLogo) => token.symbol === symbol);
    if(foundToken) { token = foundToken; }
  }

  return token.logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
export const getTokenPrice = async (chain: Chain, address: Address, decimals: number): Promise<number> => {

  // Initializations:
  let priceFound = false;
  let apiQuery: URL;

  // Fetching CoinGecko Price:
  if(address === defaultAddress) {
    apiQuery = `https://api.coingecko.com/api/v3/simple/price/?ids=${chains[chain].nativeID}&vs_currencies=usd`;
  } else {
    apiQuery = `https://api.coingecko.com/api/v3/simple/token_price/${chains[chain].cgID}?contract_addresses=${address}&vs_currencies=usd`;
  }
  try {
    let response = (await axios.get(apiQuery)).data;
    let tokens = Object.keys(response);
    if(tokens.length != 0) {
      priceFound = true;
      return response[tokens[0]].usd;
    }
  } catch {}

  // Fetching 1Inch Price:
  if(!priceFound && chains[chain].inch) {
    if(address.toLowerCase() === chains[chain].usdc.toLowerCase()) {
      return 1;
    } else {
      apiQuery = `https://api.1inch.exchange/v3.0/${chains[chain].id}/quote?fromTokenAddress=${address}&toTokenAddress=${chains[chain].usdc}&amount=${10 ** decimals}`;
      try {
        let response = (await axios.get(apiQuery)).data;
        if(response.protocols.length < 4) {
          priceFound = true;
          return response.toTokenAmount / (10 ** chains[chain].usdcDecimals);
        }
      } catch {}
    }
  }

  // Fetching ParaSwap Price:
  if(!priceFound && chains[chain].paraswap) {
    if(address.toLowerCase() === chains[chain].usdc.toLowerCase()) {
      return 1;
    } else {
      apiQuery = `https://apiv5.paraswap.io/prices?srcToken=${address}&srcDecimals=${decimals}&destToken=${chains[chain].usdc}&destDecimals=${chains[chain].usdcDecimals}&amount=${10 ** decimals}&side=SELL&network=${chains[chain].id}`;
      try {
        let response = (await axios.get(apiQuery)).data;
        let results = Object.keys(response);
        if(results.length != 0) {
          priceFound = true;
          return response[results[0]].destAmount / (10 ** chains[chain].usdcDecimals);
        }
      } catch {}
    }
  }

  // Polygon Redirections:
  if(chain === 'poly') {
    if(address.toLowerCase() === '0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f'.toLowerCase()) { // EURT
      return getTokenPrice('eth', '0xc581b735a1688071a1746c968e0798d642ede491', 6);
    }
  }

  // Fantom Redirections:
  if(chain === 'ftm') {
    if(address.toLowerCase() === '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8'.toLowerCase()) { // LINK
      return getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
    } else if(address.toLowerCase() === '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'.toLowerCase()) { // DAI
      return getTokenPrice('eth', '0x6b175474e89094c44da98b954eedeac495271d0f', 18);
    } else if(address.toLowerCase() === '0x049d68029688eabf473097a2fc38ef61633a3c7a'.toLowerCase()) { // fUSDT
      return getTokenPrice('eth', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6);
    } else if(address.toLowerCase() === '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'.toLowerCase()) { // renBTC
      return getTokenPrice('eth', '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8);
    } else if(address.toLowerCase() === '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50'.toLowerCase()) { // BUSD
      return getTokenPrice('bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18);
    } else if(address.toLowerCase() === '0x3D8f1ACCEe8e263F837138829B6C4517473d0688'.toLowerCase()) { // fWINGS
      return getTokenPrice('bsc', '0x0487b824c8261462f88940f97053e65bdb498446', 18);
    }
  }

  // Avalanche Redirections:
  if(chain === 'avax') {
    if(address.toLowerCase() === '0x4f60a160D8C2DDdaAfe16FCC57566dB84D674BD6'.toLowerCase()) { // JEWEL
      return getTokenPrice('one', '0x72cb10c6bfa5624dd07ef608027e366bd690048f', 18);
    }
  }

  // Harmony Redirections:
  if(chain === 'one') {
    if(address.toLowerCase() === '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'.toLowerCase()) { // WONE
      return getTokenPrice('one', defaultAddress, 18);
    } else if(address.toLowerCase() === '0x224e64ec1bdce3870a6a6c777edd450454068fec'.toLowerCase()) { // UST
      return getTokenPrice('eth', '0xa47c8bf37f92abed4a126bda807a7b7498661acd', 18);
    } else if(address.toLowerCase() === '0x783ee3e955832a3d52ca4050c4c251731c156020'.toLowerCase()) { // bscETH
      return getTokenPrice('eth', defaultAddress, 18);
    } else if(address.toLowerCase() === '0x0ab43550a6915f9f67d0c454c2e90385e6497eaa'.toLowerCase()) { // bscBUSD
      return getTokenPrice('bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18);
    } else if(address.toLowerCase() === '0x44ced87b9f1492bf2dcf5c16004832569f7f6cba'.toLowerCase()) { // bscUSDC
      return 1;
    } else if(address.toLowerCase() === '0x9a89d0e1b051640c6704dde4df881f73adfef39a'.toLowerCase()) { // bscUSDT
      return getTokenPrice('eth', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6);
    } else if(address.toLowerCase() === '0x08cb2917245bbe75c8c9c6dc4a7b3765dae02b31'.toLowerCase()) { // bscDOT
      return getTokenPrice('bsc', '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', 18);
    } else if(address.toLowerCase() === '0x6e7be5b9b4c9953434cd83950d61408f1ccc3bee'.toLowerCase()) { // bscMATIC
      return getTokenPrice('poly', defaultAddress, 18);
    } else if(address.toLowerCase() === '0x7a791e76bf4d4f3b9b492abb74e5108180be6b5a'.toLowerCase()) { // 1LINK
      return getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
    } else if(address.toLowerCase() === '0x352cd428efd6f31b5cae636928b7b84149cf369f'.toLowerCase()) { // 1CRV
      return getTokenPrice('eth', '0xD533a949740bb3306d119CC777fa900bA034cd52', 18);
    }
  }

  // Logging tokens with no working price feed for debugging purposes:
  console.error(`${chain.toUpperCase()}: Token Price Not Found - ${address}`);

  return 0;
}

/* ========================================================================================================================================================================= */

// Function to get the transaction history of a wallet address:
export const getTXs = async (chain: Chain, address: Address, last50?: boolean): Promise<(TransferTX | ApprovalTX)[]> => {

  // Initializations:
  let txs: (TransferTX | ApprovalTX)[] = [];
  let page = 0;
  let hasNextPage = false;
  let nullEventNativeSwapTXs: Hash[] = [];

  // Fetching TXs:
  do {
    let response;
    let errors = 0;
    while(!response && errors < 3) {
      try {
        response = (await axios.get(`https://api.covalenthq.com/v1/${chains[chain].id}/address/${address}/transactions_v2/?page-size=${last50 ? 50 : 1000}&page-number=${page++}&key=${keys.ckey}`)).data;
        if(!response.error) {
          last50 ? hasNextPage = false : hasNextPage = response.data.pagination.has_more;
          let promises = response.data.items.map((tx: any) => (async () => {
            if(tx.successful) {
    
              // Native Transfer TXs:
              if(parseInt(tx.value) > 0) {
                txs.push({
                  wallet: address,
                  chain: chain,
                  type: 'transfer',
                  hash: tx.tx_hash,
                  time: (new Date(tx.block_signed_at)).getTime() / 1000,
                  direction: tx.to_address === address.toLowerCase() ? 'in' : 'out',
                  from: tx.from_address,
                  to: tx.to_address,
                  token: {
                    address: defaultAddress,
                    symbol: chains[chain].token,
                    logo: getTokenLogo(chain, chains[chain].token)
                  },
                  value: parseInt(tx.value) / (10 ** 18),
                  fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                  nativeToken: chains[chain].token
                });
    
              // Approval TXs:
              } else if(tx.log_events.length < 3) {
                tx.log_events.forEach((event: any) => {
                  if(event.decoded != null && event.sender_contract_ticker_symbol != null) {
                    if(event.decoded.name === 'Approval') {
                      if(event.decoded.params[0].name === 'owner' && event.decoded.params[0].value === address.toLowerCase()) {
                        txs.push({
                          wallet: address,
                          chain: chain,
                          type: parseInt(event.decoded.params[2].value) > 0 ? 'approve' : 'revoke',
                          hash: tx.tx_hash,
                          time: (new Date(tx.block_signed_at)).getTime() / 1000,
                          direction: 'out',
                          token: {
                            address: event.sender_address,
                            symbol: event.sender_contract_ticker_symbol,
                            logo: getTokenLogo(chain, event.sender_contract_ticker_symbol)
                          },
                          fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                          nativeToken: chains[chain].token
                        });
                      }
                    }
                  }
                });
              }
    
              // Other TXs:
              tx.log_events.forEach((event: any) => {
                if(event.decoded != null) {
    
                  // Token Transfers:
                  if(event.decoded.name === 'Transfer') {
    
                    // Filtering Blacklisted Tokens:
                    if(!isBlacklisted(chain, event.sender_address) && event.sender_contract_ticker_symbol != null) {
    
                      // Outbound:
                      if(event.decoded.params[0].name === 'from' && event.decoded.params[0].value === address.toLowerCase() && event.decoded.params[2].decoded) {
                        if(parseInt(event.decoded.params[2].value) > 0) {
                          txs.push({
                            wallet: address,
                            chain: chain,
                            type: 'transfer',
                            hash: tx.tx_hash,
                            time: (new Date(tx.block_signed_at)).getTime() / 1000,
                            direction: 'out',
                            from: address,
                            to: event.decoded.params[1].value,
                            token: {
                              address: event.sender_address,
                              symbol: event.sender_contract_ticker_symbol,
                              logo: getTokenLogo(chain, event.sender_contract_ticker_symbol)
                            },
                            value: parseInt(event.decoded.params[2].value) / (10 ** event.sender_contract_decimals),
                            fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                            nativeToken: chains[chain].token
                          });
                        }
                      
                      // Inbound:
                      } else if(event.decoded.params[1].name === 'to' && event.decoded.params[1].value === address.toLowerCase() && event.decoded.params[2].decoded) {
                        if(parseInt(event.decoded.params[2].value) > 0) {
                          txs.push({
                            wallet: address,
                            chain: chain,
                            type: 'transfer',
                            hash: tx.tx_hash,
                            time: (new Date(tx.block_signed_at)).getTime() / 1000,
                            direction: 'in',
                            from: event.decoded.params[0].value,
                            to: address,
                            token: {
                              address: event.sender_address,
                              symbol: event.sender_contract_ticker_symbol,
                              logo: getTokenLogo(chain, event.sender_contract_ticker_symbol)
                            },
                            value: parseInt(event.decoded.params[2].value) / (10 ** event.sender_contract_decimals),
                            fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                            nativeToken: chains[chain].token
                          });
                        }
                      }
                    }
                  
                  // Native Router Swaps:
                  } else if(event.decoded.name === 'Withdrawal' && event.decoded.params[0].value === tx.to_address) {
                    let nullEvent = tx.log_events.find((event: any) => event.decoded === null);
                    if(nullEvent) {
                      if(!nullEventNativeSwapTXs.includes(nullEvent.tx_hash)) {
                        nullEventNativeSwapTXs.push(nullEvent.tx_hash);
    
                        // ParaSwap TXs:
                        if(nullEvent.raw_log_topics[0] === '0x680ad12fcfabafe9b1f08214caef968eb651cf010bee4a2824adfaec965903e8' && nullEvent.raw_log_topics[3].endsWith('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')) {
                          txs.push({
                            wallet: address,
                            chain: chain,
                            type: 'transfer',
                            hash: tx.tx_hash,
                            time: (new Date(tx.block_signed_at)).getTime() / 1000,
                            direction: 'in',
                            from: tx.to_address,
                            to: tx.from_address,
                            token: {
                              address: defaultAddress,
                              symbol: chains[chain].token,
                              logo: getTokenLogo(chain, chains[chain].token)
                            },
                            value: ((parseInt(nullEvent.raw_log_data.slice(194, 258), 16) + parseInt(nullEvent.raw_log_data.slice(258, 322), 16)) / 2) / (10 ** 18),
                            fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                            nativeToken: chains[chain].token
                          });
                        }
                      }
                    } else {
                      txs.push({
                        wallet: address,
                        chain: chain,
                        type: 'transfer',
                        hash: tx.tx_hash,
                        time: (new Date(tx.block_signed_at)).getTime() / 1000,
                        direction: 'in',
                        from: tx.to_address,
                        to: tx.from_address,
                        token: {
                          address: defaultAddress,
                          symbol: chains[chain].token,
                          logo: getTokenLogo(chain, chains[chain].token)
                        },
                        value: parseInt(event.decoded.params[1].value) / (10 ** 18),
                        fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
                        nativeToken: chains[chain].token
                      });
                    }
                  }
                }
              });
            }
          })());
          await Promise.all(promises);
        } else {
          hasNextPage = false;
        }
      } catch(err: any) {
        if(++errors > 2) {
          console.error(`Covalent API Error: ${err.response.status}`);
        }
        hasNextPage = false;
      }
    }
  } while(hasNextPage);

  return txs;
}

/* ========================================================================================================================================================================= */

// Function to get the simple/quick transaction history of a wallet address:
export const getSimpleTXs = async (chain: Chain, address: Address): Promise<SimpleTX[]> => {

  // Initializations:
  let txs: SimpleTX[] = [];
  let page = 0;
  let hasNextPage = false;

  // Fetching TXs:
  do {
    let response;
    let errors = 0;
    while(!response && errors < 3) {
      try {
        response = (await axios.get(`https://api.covalenthq.com/v1/${chains[chain].id}/address/${address}/transactions_v2/?no-logs=true&page-size=1000&page-number=${page++}&key=${keys.ckey}`)).data;
        if(!response.error) {
          hasNextPage = response.data.pagination.has_more;
          let promises = response.data.items.map((tx: any) => (async () => {
            txs.push({
              wallet: address,
              chain: chain,
              hash: tx.tx_hash,
              time: (new Date(tx.block_signed_at)).getTime() / 1000,
              direction: tx.from_address === address.toLowerCase() ? 'out' : 'in',
              fee: tx.gas_price < 1000000000000 ? (tx.gas_spent * tx.gas_price) / (10 ** 18) : tx.gas_price / (10 ** 18)
            });
          })());
          await Promise.all(promises);
        } else {
          hasNextPage = false;
        }
      } catch(err: any) {
        if(++errors > 2) {
          console.error(`Covalent API Error: ${err.response.status}`);
        }
        hasNextPage = false;
      }
    }
  } while(hasNextPage);

  return txs;
}

/* ========================================================================================================================================================================= */

// Function to check if a token is blacklisted:
export const isBlacklisted = (chain: Chain, address: Address): boolean => {

  // Checking Blacklists:
  if(chain === 'eth') {
    if(eth_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  } else if(chain === 'bsc') {
    if(bsc_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  } else if(chain === 'poly') {
    if(poly_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  } else if(chain === 'ftm') {
    if(ftm_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  } else if(chain === 'avax') {
    if(avax_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  } else if(chain === 'one') {
    if(one_data.blacklist.includes(address.toLowerCase() as Address)) {
      return true;
    }
  }

  return false;
}

/* ========================================================================================================================================================================= */

// Function to get S4D token info:
export const addS4DToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let controller = await query(chain, address, snowball.s4dABI, 'owner', []);
  let price = parseInt(await query(chain, controller, snowball.s4dControllerABI, 'getVirtualPrice', [])) / (10 ** decimals);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Trader Joe token info (xJOE):
export const addTraderJoeToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let underlyingToken = await query(chain, address, traderjoe.joeABI, 'joe', []);
  let joeStaked = parseInt(await query(chain, underlyingToken, minABI, 'balanceOf', [address]));
  let xjoeSupply = parseInt(await query(chain, address, minABI, 'totalSupply', []));
  let multiplier = joeStaked / xjoeSupply;
  let price = multiplier * (await getTokenPrice(chain, underlyingToken, decimals));

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Aave BLP token info:
export const addAaveBLPToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<LPToken> => {

  // Initializing Token Values:
  let type: TokenType = 'lpToken';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  address = await query(chain, address, aave.lpABI, 'bPool', []);

  // Finding LP Token Info:
  let lpTokenSupply = await query(chain, address, balancer.tokenABI, 'totalSupply', []) / (10 ** decimals);
  let lpTokenAddresses = await query(chain, address, balancer.tokenABI, 'getCurrentTokens', []);
  let address0 = lpTokenAddresses[0];
  let address1 = lpTokenAddresses[1];
  let supply0 = await query(chain, address, balancer.tokenABI, 'getBalance', [address0]) / (10 ** decimals);
  let supply1 = await query(chain, address, balancer.tokenABI, 'getBalance', [address1]) / (10 ** decimals);
  let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
  let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
  let symbol0 = await query(chain, address0, minABI, 'symbol', []);
  let symbol1 = await query(chain, address1, minABI, 'symbol', []);

  // First Paired Token:
  let token0: PricedToken = {
    symbol: symbol0,
    address: address0,
    balance: supply0 * (balance / lpTokenSupply),
    price: await getTokenPrice(chain, address0, decimals0),
    logo: getTokenLogo(chain, symbol0)
  }

  // Second Paired Token:
  let token1: PricedToken = {
    symbol: symbol1,
    address: address1,
    balance: supply1 * (balance / lpTokenSupply),
    price: await getTokenPrice(chain, address1, decimals1),
    logo: getTokenLogo(chain, symbol1)
  }

  return { type, chain, location, owner, symbol, address, balance, token0, token1 };
}

/* ========================================================================================================================================================================= */

// Function to get 4Belt token info:
export const add4BeltToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = '4Belt';
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);
  let price = 1;

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Belt token info:
export const addBeltToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let multiplier = parseInt(await query(chain, address, belt.tokenABI, 'getPricePerFullShare', [])) / (10 ** decimals);
  let underlyingToken = await query(chain, address, belt.tokenABI, 'token', []);
  let price = multiplier * (await getTokenPrice(chain, underlyingToken, decimals));

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Alpaca token info:
export const addAlpacaToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let totalToken = parseInt(await query(chain, address, alpaca.tokenABI, 'totalToken', []));
  let totalSupply = parseInt(await query(chain, address, minABI, 'totalSupply', []));
  let multiplier = totalToken / totalSupply;
  let underlyingToken = await query(chain, address, alpaca.tokenABI, 'token', []);
  let price = multiplier * (await getTokenPrice(chain, underlyingToken, decimals));

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Curve token info:
export const addCurveToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token | LPToken> => {
  
  // Ethereum Token:
  if(chain === 'eth') {

    // Generic Token Values:
    let registry: Address = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';
    let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
    let balance = rawBalance / (10 ** decimals);
    let symbol = await query(chain, address, minABI, 'symbol', []);
    let lpTokenSupply = await query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
    let poolAddress = await query(chain, registry, curve.registryABI, 'get_pool_from_lp_token', [address]);
    let tokens = (await query(chain, registry, curve.registryABI, 'get_underlying_coins', [poolAddress])).filter((token: Address) => token != zero);
    let reserves = (await query(chain, registry, curve.registryABI, 'get_underlying_balances', [poolAddress])).filter((balance: number) => balance != 0);
    let multiplier = parseInt(await query(chain, registry, curve.registryABI, 'get_virtual_price_from_lp_token', [address])) / (10 ** decimals);

    // Function to redirect synthetic asset price fetching:
    const getPrice = async (chain: Chain, address: Address, decimals: number): Promise<number> => {
      if(address.toLowerCase() === '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6'.toLowerCase()) { // sLINK
        return await getTokenPrice(chain, '0x514910771af9ca656af840dff83e8264ecf986ca', decimals);
      } else if(address.toLowerCase() === '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'.toLowerCase()) { // sBTC
        return await getTokenPrice(chain, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals);
      } else if(address.toLowerCase() === '0xd71ecff9342a5ced620049e616c5035f1db98620'.toLowerCase()) { // sEUR
        return await getTokenPrice(chain, '0xdb25f211ab05b1c97d595516f45794528a807ad8', decimals);
      } else {
        return await getTokenPrice(chain, address, decimals);
      }
    }

    // 3+ Asset Tokens:
    if(tokens.length > 2) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let price = 0;
      for(let i = 0; i < tokens.length; i++) {
        let tokenDecimals = parseInt(await query(chain, tokens[i], minABI, 'decimals', []));
        let tokenPrice = await getPrice(chain, tokens[i], tokenDecimals);
        price += (parseInt(reserves[i]) / (10 ** tokenDecimals)) * tokenPrice;
      }
      price /= lpTokenSupply;
      price *= multiplier;

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // Standard LP Tokens:
    } else if(tokens.length === 2) {

      // Initializing Token Values:
      let type: TokenType = 'lpToken';

      // Finding LP Token Info:
      let address0 = tokens[0];
      let address1 = tokens[1];
      let decimals0 = 18;
      let decimals1 = 18;
      let symbol0 = '';
      let symbol1 = '';
      if(tokens[0].toLowerCase() === defaultAddress) {
        symbol0 = 'ETH';
      } else {
        decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
        symbol0 = await query(chain, address0, minABI, 'symbol', []);
      }
      if(tokens[1].toLowerCase() === defaultAddress) {
        symbol1 = 'ETH';
      } else {
        decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
        symbol1 = await query(chain, address1, minABI, 'symbol', []);
      }

      // First Paired Token:
      let token0: PricedToken = {
        symbol: symbol0,
        address: address0,
        balance: (parseInt(reserves[0]) / (10 ** 18)) * (balance / lpTokenSupply),
        price: await getTokenPrice(chain, address0, decimals0),
        logo: getTokenLogo(chain, symbol0)
      }

      // Second Paired Token:
      let token1: PricedToken = {
        symbol: symbol1,
        address: address1,
        balance: (parseInt(reserves[1]) / (10 ** 18)) * (balance / lpTokenSupply),
        price: await getTokenPrice(chain, address1, decimals1),
        logo: getTokenLogo(chain, symbol1)
      }

      return { type, chain, location, owner, symbol, address, balance, token0, token1 };
    }

  // Polygon Token:
  } else if(chain === 'poly') {

    // Generic Token Values:
    let symbol = await query(chain, address, minABI, 'symbol', []);
    let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
    let balance = rawBalance / (10 ** decimals);
    
    // crvUSDBTCETH (Atricrypto V3):
    if(address.toLowerCase() === '0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let lpTokenSupply = await query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.polyTokenABI, 'minter', []);
      let multiplier = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      let address0 = await query(chain, minter, curve.minterABI, 'coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'coins', [1]);
      let address2 = await query(chain, minter, curve.minterABI, 'coins', [2]);
      let token0 = await query(chain, address0, curve.polyTokenABI, 'minter', []);
      let token1 = await query(chain, address1, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let token2 = await query(chain, address2, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals0 = 18;
      let decimals1 = parseInt(await query(chain, token1, minABI, 'decimals', []));
      let decimals2 = parseInt(await query(chain, token2, minABI, 'decimals', []));
      let supply0 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** decimals0);
      let supply1 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [1])) / (10 ** decimals1);
      let supply2 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [2])) / (10 ** decimals2);
      let price0 = parseInt(await query(chain, token0, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals0);
      let price1 = await getTokenPrice(chain, token1, decimals1);
      let price2 = await getTokenPrice(chain, token2, decimals2);
      let price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // am3CRV (Aave):
    } else if(address.toLowerCase() === '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let minter = await query(chain, address, curve.polyTokenABI, 'minter', []);
      let price = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0xf8a57c1d3b9629b77b6726a042ca48990A84Fb49'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'lpToken';

      // Finding LP Token Info:
      let lpTokenSupply = await query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.polyTokenABI, 'minter', []);
      let address0 = await query(chain, minter, curve.minterABI, 'underlying_coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'underlying_coins', [1]);
      let symbol0 = await query(chain, address0, minABI, 'symbol', []);
      let symbol1 = await query(chain, address1, minABI, 'symbol', []);
      let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
      let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
      let supply0 = await query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      let supply1 = await query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);

      // First Paired Token:
      let token0: PricedToken = {
        symbol: symbol0,
        address: address0,
        balance: (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0),
        price: await getTokenPrice(chain, address0, decimals0),
        logo: getTokenLogo(chain, symbol0)
      }

      // Second Paired Token:
      let token1: PricedToken = {
        symbol: symbol1,
        address: address1,
        balance: (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1),
        price: await getTokenPrice(chain, address1, decimals1),
        logo: getTokenLogo(chain, symbol1)
      }

      return { type, chain, location, owner, symbol, address, balance, token0, token1 };

    // crvEURTUSD (EURtUSD):
    } else if(address.toLowerCase() === '0x600743B1d8A96438bD46836fD34977a00293f6Aa'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let lpTokenSupply = await query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.polyTokenABI, 'minter', []);
      let multiplier = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      let token0 = await query(chain, minter, curve.minterABI, 'coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'coins', [1]);
      let token1 = await query(chain, address1, curve.polyTokenABI, 'minter', []);
      let decimals0 = parseInt(await query(chain, token0, minABI, 'decimals', []));
      let decimals1 = 18;
      let supply0 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** decimals0);
      let supply1 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [1])) / (10 ** decimals1);
      let price0 = await getTokenPrice(chain, token0, decimals0);
      let price1 = parseInt(await query(chain, token1, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals1);
      let price = multiplier * (((supply0 * price0) + (supply1 * price1)) / lpTokenSupply);

      return { type, chain, location, owner, symbol, address, balance, price, logo };
    }

  // Fantom Token:
  } else if(chain === 'ftm') {

    // Generic Token Values:
    let symbol = await query(chain, address, minABI, 'symbol', []);
    let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
    let balance = rawBalance / (10 ** decimals);
    
    // DAI+USDC (2pool):
    if(address.toLowerCase() === '0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'lpToken';

      // Finding LP Token Info:
      let lpTokenSupply = await query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let address0 = await query(chain, address, curve.ftmTokenABI, 'coins', [0]);
      let address1 = await query(chain, address, curve.ftmTokenABI, 'coins', [1]);
      let symbol0 = await query(chain, address0, minABI, 'symbol', []);
      let symbol1 = await query(chain, address1, minABI, 'symbol', []);
      let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
      let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
      let supply0 = await query(chain, address, curve.ftmTokenABI, 'balances', [0]) / (10 ** decimals);
      let supply1 = await query(chain, address, curve.ftmTokenABI, 'balances', [1]) / (10 ** decimals);

      // First Paired Token:
      let token0: PricedToken = {
        symbol: symbol0,
        address: address0,
        balance: (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0),
        price: await getTokenPrice(chain, address0, decimals0),
        logo: getTokenLogo(chain, symbol0)
      }

      // Second Paired Token:
      let token1: PricedToken = {
        symbol: symbol1,
        address: address1,
        balance: (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1),
        price: await getTokenPrice(chain, address1, decimals1),
        logo: getTokenLogo(chain, symbol1)
      }

      return { type, chain, location, owner, symbol, address, balance, token0, token1 };

    // fUSDT+DAI+USDC (fUSDT):
    } else if(address.toLowerCase() === '0x92D5ebF3593a92888C25C0AbEF126583d4b5312E'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);
      symbol = 'fUSDTCRV';

      // Finding Token Price:
      let price = parseInt(await query(chain, address, curve.ftmTokenABI, 'get_virtual_price', [])) / (10 ** decimals);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'lpToken';

      // Finding LP Token Info:
      let lpTokenSupply = await query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.ftmTokenABI, 'minter', []);
      let address0 = await query(chain, minter, curve.minterABI, 'coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'coins', [1]);
      let symbol0 = await query(chain, address0, minABI, 'symbol', []);
      let symbol1 = await query(chain, address1, minABI, 'symbol', []);
      let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
      let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
      let supply0 = await query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      let supply1 = await query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);

      // First Paired Token:
      let token0: PricedToken = {
        symbol: symbol0,
        address: address0,
        balance: (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0),
        price: await getTokenPrice(chain, address0, decimals0),
        logo: getTokenLogo(chain, symbol0)
      }

      // Second Paired Token:
      let token1: PricedToken = {
        symbol: symbol1,
        address: address1,
        balance: (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1),
        price: await getTokenPrice(chain, address1, decimals1),
        logo: getTokenLogo(chain, symbol1)
      }

      return { type, chain, location, owner, symbol, address, balance, token0, token1 };

    // crv3crypto (Tricrypto):
    } else if(address.toLowerCase() === '0x58e57cA18B7A47112b877E31929798Cd3D703b0f'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let lpTokenSupply = await query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.ftmTokenABI, 'minter', []);
      let multiplier = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      let token0 = await query(chain, minter, curve.minterABI, 'coins', [0]);
      let token1 = await query(chain, minter, curve.minterABI, 'coins', [1]);
      let token2 = await query(chain, minter, curve.minterABI, 'coins', [2]);
      let decimals0 = parseInt(await query(chain, token0, minABI, 'decimals', []));
      let decimals1 = parseInt(await query(chain, token1, minABI, 'decimals', []));
      let decimals2 = parseInt(await query(chain, token2, minABI, 'decimals', []));
      let supply0 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** decimals0);
      let supply1 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [1])) / (10 ** decimals1);
      let supply2 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [2])) / (10 ** decimals2);
      let price0 = await getTokenPrice(chain, token0, decimals0);
      let price1 = await getTokenPrice(chain, token1, decimals1);
      let price2 = await getTokenPrice(chain, token2, decimals2);
      let price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // g3CRV (Geist):
    } else if(address.toLowerCase() === '0xD02a30d33153877BC20e5721ee53DeDEE0422B2F'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let minter = await query(chain, address, curve.ftmTokenABI, 'minter', []);
      let price = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      return { type, chain, location, owner, symbol, address, balance, price, logo };
    }

  // Avalanche Token:
  } else if(chain === 'avax') {

    // Generic Token Values:
    let symbol = await query(chain, address, minABI, 'symbol', []);
    let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
    let balance = rawBalance / (10 ** decimals);
    
    // crvUSDBTCETH (Atricrypto V2):
    if(address.toLowerCase() === '0x1daB6560494B04473A0BE3E7D83CF3Fdf3a51828'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let lpTokenSupply = await query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.avaxTokenABI, 'minter', []);
      let multiplier = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      let address0 = await query(chain, minter, curve.minterABI, 'coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'coins', [1]);
      let address2 = await query(chain, minter, curve.minterABI, 'coins', [2]);
      let token0 = await query(chain, address0, curve.avaxTokenABI, 'minter', []);
      let token1 = await query(chain, address1, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let token2 = await query(chain, address2, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals0 = 18;
      let decimals1 = parseInt(await query(chain, token1, minABI, 'decimals', []));
      let decimals2 = parseInt(await query(chain, token2, minABI, 'decimals', []));
      let supply0 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** decimals0);
      let supply1 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [1])) / (10 ** decimals1);
      let supply2 = parseInt(await query(chain, minter, curve.minterABI, 'balances', [2])) / (10 ** decimals2);
      let price0 = parseInt(await query(chain, token0, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals0);
      let price1 = await getTokenPrice(chain, token1, decimals1);
      let price2 = await getTokenPrice(chain, token2, decimals2);
      let price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // am3CRV (Aave):
    } else if(address.toLowerCase() === '0x1337BedC9D22ecbe766dF105c9623922A27963EC'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'token';
      let logo = getTokenLogo(chain, symbol);

      // Finding Token Price:
      let minter = await query(chain, address, curve.avaxTokenABI, 'minter', []);
      let price = parseInt(await query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      return { type, chain, location, owner, symbol, address, balance, price, logo };

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0xC2b1DF84112619D190193E48148000e3990Bf627'.toLowerCase()) {

      // Initializing Token Values:
      let type: TokenType = 'lpToken';

      // Finding LP Token Info:
      let lpTokenSupply = await query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await query(chain, address, curve.avaxTokenABI, 'minter', []);
      let address0 = await query(chain, minter, curve.minterABI, 'underlying_coins', [0]);
      let address1 = await query(chain, minter, curve.minterABI, 'underlying_coins', [1]);
      let symbol0 = await query(chain, address0, minABI, 'symbol', []);
      let symbol1 = await query(chain, address1, minABI, 'symbol', []);
      let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
      let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));
      let supply0 = await query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      let supply1 = await query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);

      // First Paired Token:
      let token0: PricedToken = {
        symbol: symbol0,
        address: address0,
        balance: (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0),
        price: await getTokenPrice(chain, address0, decimals0),
        logo: getTokenLogo(chain, symbol0)
      }

      // Second Paired Token:
      let token1: PricedToken = {
        symbol: symbol1,
        address: address1,
        balance: (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1),
        price: await getTokenPrice(chain, address1, decimals1),
        logo: getTokenLogo(chain, symbol1)
      }

      return { type, chain, location, owner, symbol, address, balance, token0, token1 };
    }
  }

  // No Token Identified:
  return {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '???',
    address: address,
    balance: 0,
    price: 0,
    logo: defaultTokenLogo
  }
}

/* ========================================================================================================================================================================= */

// Function to get BZX token info:
export const addBZXToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let multiplier = parseInt(await query(chain, address, bzx.tokenABI, 'tokenPrice', [])) / (10 ** decimals);
  let underlyingToken = await query(chain, address, bzx.tokenABI, 'loanTokenAddress', []);
  let price = multiplier * (await getTokenPrice(chain, underlyingToken, decimals));

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Balancer LP token info:
export const addBalancerToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address, id: string): Promise<Token | LPToken> => {

  // Generic Token Values:
  let vault: Address = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
  let poolInfo = await query(chain, vault, balancer.vaultABI, 'getPoolTokens', [id]);
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let lpTokenSupply = parseInt(await query(chain, address, minABI, 'totalSupply', []));

  // 3+ Asset Tokens:
  if(poolInfo.tokens.length > 2) {

    // Initializing Token Values:
    let type: TokenType = 'token';
    let logo = getTokenLogo(chain, symbol);

    // Finding Token Price:
    let priceSum = 0;
    for(let i = 0; i < poolInfo.tokens.length; i++) {
      let tokenDecimals = parseInt(await query(chain, poolInfo.tokens[i], minABI, 'decimals', []));
      let tokenPrice = await getTokenPrice(chain, poolInfo.tokens[i], tokenDecimals);
      priceSum += (parseInt(poolInfo.balances[i]) / (10 ** tokenDecimals)) * tokenPrice;
    }
    let price = priceSum / (lpTokenSupply / (10 ** decimals));

    return { type, chain, location, owner, symbol, address, balance, price, logo };

  // Standard LP Tokens:
  } else if(poolInfo.tokens.length === 2) {

    // Initializing Token Values:
    let type: TokenType = 'lpToken';

    // Finding LP Token Info:
    let address0 = poolInfo.tokens[0];
    let address1 = poolInfo.tokens[1];
    let symbol0 = await query(chain, address0, minABI, 'symbol', []);
    let symbol1 = await query(chain, address1, minABI, 'symbol', []);
    let decimals0 = parseInt(await query(chain, address0, minABI, 'decimals', []));
    let decimals1 = parseInt(await query(chain, address1, minABI, 'decimals', []));

    // First Paired Token:
    let token0: PricedToken = {
      symbol: symbol0,
      address: address0,
      balance: (parseInt(poolInfo.balances[0]) * (balance / lpTokenSupply)) / (10 ** decimals0),
      price: await getTokenPrice(chain, address0, decimals0),
      logo: getTokenLogo(chain, symbol0)
    }

    // Second Paired Token:
    let token1: PricedToken = {
      symbol: symbol1,
      address: address1,
      balance: (parseInt(poolInfo.balances[1]) * (balance / lpTokenSupply)) / (10 ** decimals1),
      price: await getTokenPrice(chain, address1, decimals1),
      logo: getTokenLogo(chain, symbol1)
    }

    return { type, chain, location, owner, symbol, address, balance, token0, token1 };
  }

  // No Token Identified:
  return {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '???',
    address: address,
    balance: 0,
    price: 0,
    logo: defaultTokenLogo
  }
}

/* ========================================================================================================================================================================= */

// Function to get Iron token info:
export const addIronToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let swapAddress = await query(chain, address, iron.tokenABI, 'swap', []);
  let price = parseInt(await query(chain, swapAddress, iron.swapABI, 'getVirtualPrice', [])) / (10 ** decimals);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get Axial token info:
export const addAxialToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = getTokenLogo(chain, symbol);

  // Finding Token Price:
  let swapAddress = await query(chain, address, axial.tokenABI, 'owner', []);
  let price = parseInt(await query(chain, swapAddress, axial.swapABI, 'getVirtualPrice', [])) / (10 ** decimals);

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}

/* ========================================================================================================================================================================= */

// Function to get mStable token info:
export const addStableToken = async (chain: Chain, location: string, address: Address, rawBalance: number, owner: Address): Promise<Token> => {

  // Initializing Token Values:
  let type: TokenType = 'token';
  let symbol = await query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await query(chain, address, minABI, 'decimals', []));
  let balance = rawBalance / (10 ** decimals);
  let logo = defaultTokenLogo;

  // Finding Token Price:
  let price = parseInt((await query(chain, address, mstable.stableABI, 'getPrice', [])).price) / (10 ** decimals);

  // Finding Token Symbol:
  logo = price > 1000 ? getTokenLogo(chain, 'mBTC') : getTokenLogo(chain, 'mUSD');

  return { type, chain, location, owner, symbol, address, balance, price, logo };
}