
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Imports:
import { minABI } from './ABIs.js';
import { eth_token_logos } from './tokens/ethereum.js';
import { bsc_token_logos } from './tokens/bsc.js';
import { poly_token_logos } from './tokens/polygon.js';
import { ftm_tokens, ftm_token_logos } from './tokens/fantom.js';
import { avax_tokens, avax_token_logos } from './tokens/avalanche.js';
import { one_tokens, one_token_logos } from './tokens/harmony.js';

// Initializations:
let ethTokenPrices = [];
let bscTokenPrices = [];
let polyTokenPrices = [];
let ftmTokenPrices = [];
let avaxTokenPrices = [];
let oneTokenPrices = [];

/* ========================================================================================================================================================================= */

// Function to get native token info:
export const addNativeToken = async (chain, balance, owner) => {

  // Initializing New Token:
  let newToken = {
    type: 'nativeToken',
    chain: chain,
    location: 'wallet',
    owner: owner,
    symbol: '',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decimals: 18,
    balance: balance,
    price: 0,
    logo: ''
  }

  // ETH:
  if(chain === 'eth') {
    newToken.symbol = 'ETH';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;

  // BNB:
  } else if(chain === 'bsc') {
    newToken.symbol = 'BNB';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;

  // MATIC:
  } else if(chain === 'poly') {
    newToken.symbol = 'MATIC';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;

  // FTM:
  } else if(chain === 'ftm') {
    newToken.symbol = 'FTM';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;

  // AVAX:
  } else if(chain === 'avax') {
    newToken.symbol = 'AVAX';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;

  // ONE:
  } else if(chain === 'one') {
    newToken.symbol = 'ONE';
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, newToken.address, newToken.decimals);
    return newToken;
  }
}

/* ========================================================================================================================================================================= */

// Function to get token info:
export const addToken = async (chain, location, address, balance, owner, ethers_provider) => {
    
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    decimals: 18,
    balance: balance,
    price: 0,
    logo: ''
  }

  // Ethereum Token:
  if(chain === 'eth') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'ETH';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;
  
  // Binance Smart Chain Token:
  } else if(chain === 'bsc') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'BNB';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;

  // Polygon Token:
  } else if(chain === 'poly') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'MATIC';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;

  // Fantom Token:
  } else if(chain === 'ftm') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'FTM';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;

  // Avalanche Token:
  } else if(chain === 'avax') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'AVAX';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;

  // Harmony Token:
  } else if(chain === 'one') {
    if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      newToken.symbol = 'ONE';
      newToken.decimals = 18;
    } else {
      let contract = new ethers.Contract(address, minABI, ethers_provider);
      newToken.symbol = await contract.symbol();
      newToken.decimals = parseInt(await contract.decimals());
    }
    newToken.logo = getTokenLogo(chain, newToken.symbol);
    newToken.price = await getTokenPrice(chain, address, newToken.decimals);
    return newToken;
  }
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
export const getTokenLogo = (chain, symbol) => {

  // Initializing Default Logo:
  let logo = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';

  // Ehereum Token:
  if(chain === 'eth') {
    if(eth_token_logos.hasOwnProperty(symbol)) {
      logo = eth_token_logos[symbol];
    }
    
  // Binance Smart Chain Token:
  } else if(chain === 'bsc') {
    if(bsc_token_logos.hasOwnProperty(symbol)) {
      logo = bsc_token_logos[symbol];
    }

  // Polygon Token:
  } else if(chain === 'poly') {
    if(poly_token_logos.hasOwnProperty(symbol)) {
      logo = poly_token_logos[symbol];
    }
  
  // Fantom Token:
  } else if(chain === 'ftm') {
    if(ftm_token_logos.hasOwnProperty(symbol)) {
      logo = ftm_token_logos[symbol];
    }

  // Avalanche Token:
  } else if(chain === 'avax') {
    if(avax_token_logos.hasOwnProperty(symbol)) {
      logo = avax_token_logos[symbol];
    }

  // Harmony Token:
  } else if(chain === 'one') {
    if(one_token_logos.hasOwnProperty(symbol)) {
      logo = one_token_logos[symbol];
    }
  }

  return logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
export const getTokenPrice = async (chain, address, decimals) => {

  try {

    // Ehereum Token:
    if(chain === 'eth') {
      let usdToken = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // Using USDC.
      if(address === '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2') { usdToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; } // Using DAI for price fetching.
      if(usdToken.toLowerCase() === address.toLowerCase()) { return 1; }
      let token = ethTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        let apiQuery = 'https://api.1inch.exchange/v3.0/1/quote?fromTokenAddress=' + address + '&toTokenAddress=' + usdToken + '&amount=' + (10 ** decimals);
        try {
          let result = await axios.get(apiQuery);
          let price = result.data.toTokenAmount / 10e5;
          if(usdToken === '0x6b175474e89094c44da98b954eedeac495271d0f') { price /= 10e11; } // Correcting price for DAI price fetching.
          if(result.data.protocols.length > 4) {
            console.error('1inch API error: 1inch is having issues on their end - refresh or wait a couple minutes.');
            return 0;
          } else {
            ethTokenPrices.push({token: address.toLowerCase(), price});
            return price;
          }
        } catch {
          console.error('1inch API error: Could not get price for Ethereum token:', address);
          return 0;
        }
      }
      
    // Checking Price of Binance Smart Chain Token:
    } else if(chain === 'bsc') {
      let usdToken = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'; // Using USDC.
      if(usdToken.toLowerCase() === address.toLowerCase()) { return 1; }
      let token = bscTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        let apiQuery = 'https://api.1inch.exchange/v3.0/56/quote?fromTokenAddress=' + address + '&toTokenAddress=' + usdToken + '&amount=' + (10 ** decimals);
        try {
          let result = await axios.get(apiQuery);
          let price = result.data.toTokenAmount / 10e17;
          if(result.data.protocols.length > 4) {
            console.error('1inch API error: 1inch is having issues on their end - refresh or wait a couple minutes.');
            return 0;
          } else {
            bscTokenPrices.push({token: address.toLowerCase(), price});
            return price;
          }
        } catch {
          console.error('1inch API error: Could not get price for BSC token:', address);
          return 0;
        }
      }

    // Checking Price of Polygon Chain Token:
    } else if(chain === 'poly') {
      let usdToken = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'; // Using USDC.
      if(usdToken.toLowerCase() === address.toLowerCase()) { return 1; }
      let token = polyTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        let apiQuery = 'https://api.1inch.exchange/v3.0/137/quote?fromTokenAddress=' + address + '&toTokenAddress=' + usdToken + '&amount=' + (10 ** decimals);
        try {
          let result = await axios.get(apiQuery);
          let price = result.data.toTokenAmount / 10e5;
          if(result.data.protocols.length > 4) {
            console.error('1inch API error: 1inch is having issues on their end - refresh or wait a couple minutes.');
            return 0;
          } else {
            polyTokenPrices.push({token: address.toLowerCase(), price});
            return price;
          }
        } catch {
          console.error('1inch API error: Could not get price for Polygon token:', address);
          return 0;
        }
      }

    // Checking Price of Fantom Chain Token:
    } else if(chain === 'ftm') {

      // Getting Price Data (Runs Once):
      if(ftmTokenPrices.length === 0) {
        let tokenList = '';
        ftm_tokens.forEach(token => {
          tokenList += token.address + ',';
        });
        let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/fantom?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
        try {
          let result = await axios.get(apiQuery);
          let tokens = Object.keys(result.data);
          tokens.forEach(token => {
            ftmTokenPrices.push({token: token.toLowerCase(), price: result.data[token.toLowerCase()].usd});
          });
        } catch {
          console.error('CoinGecko API Error: Unable to fetch Fantom token prices.');
          return 0;
        }
      }

      // Finding Token Price in Data:
      if(address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') { address = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'; }
      let token = ftmTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        if(address.toLowerCase() === '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8'.toLowerCase()) { // LINK
          return getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
        } else if(address.toLowerCase() === '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'.toLowerCase()) { // DAI
          return getTokenPrice('eth', '0x6b175474e89094c44da98b954eedeac495271d0f', 18);
        } else if(address.toLowerCase() === '0x29b0Da86e484E1C0029B56e817912d778aC0EC69'.toLowerCase()) { // YFI
          return getTokenPrice('eth', '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', 18);
        } else if(address.toLowerCase() === '0x049d68029688eabf473097a2fc38ef61633a3c7a'.toLowerCase()) { // fUSDT
          return getTokenPrice('eth', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6);
        } else if(address.toLowerCase() === '0xd6070ae98b8069de6B494332d1A1a81B6179D960'.toLowerCase()) { // BIFI
          return getTokenPrice('bsc', '0xCa3F508B8e4Dd382eE878A314789373D80A5190A', 18);
        } else if(address.toLowerCase() === '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'.toLowerCase()) { // renBTC
          return getTokenPrice('eth', '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8);
        } else if(address.toLowerCase() === '0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454'.toLowerCase()) { // BNB
          return getTokenPrice('bsc', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
        } else if(address.toLowerCase() === '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50'.toLowerCase()) { // BUSD
          return getTokenPrice('bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18);
        } else if(address.toLowerCase() === '0x3D8f1ACCEe8e263F837138829B6C4517473d0688'.toLowerCase()) { // fWINGS
          return getTokenPrice('bsc', '0x0487b824c8261462f88940f97053e65bdb498446', 18);
        } else if(address.toLowerCase() === '0x82f0B8B456c1A451378467398982d4834b6829c1'.toLowerCase()) { // MIM
          return getTokenPrice('eth', '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3', 18);
        } else if(address.toLowerCase() === '0x260b3e40c714ce8196465ec824cd8bb915081812'.toLowerCase()) { // IronICE
          return getTokenPrice('poly', '0x4A81f8796e0c6Ad4877A51C86693B0dE8093F2ef', 18);
        } else {
          console.error('Could not find price for Fantom token:', address);
          return 0;
        }
      }

    // Checking Price of Avalanche Chain Token:
    } else if(chain === 'avax') {

      // Getting Price Data (Runs Once):
      if(avaxTokenPrices.length === 0) {
        let tokenList = '';
        avax_tokens.forEach(token => {
          tokenList += token.address + ',';
        });
        let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
        try {
          let result = await axios.get(apiQuery);
          let tokens = Object.keys(result.data);
          tokens.forEach(token => {
            avaxTokenPrices.push({token: token.toLowerCase(), price: result.data[token.toLowerCase()].usd});
          });
          return 0;
        } catch {
          console.error('CoinGecko API Error: Unable to fetch Avalanche token prices.');
          return 0;
        }
      }

      // Finding Token Price in Data:
      if(address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') { address = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'; }
      let token = avaxTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        if(address.toLowerCase() === '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664'.toLowerCase()) { // USDC.e
          return getTokenPrice('eth', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6);
        } else if(address.toLowerCase() === '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB'.toLowerCase()) { // WBTC
          return getTokenPrice('bsc', '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', 18);
        } else if(address.toLowerCase() === '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15'.toLowerCase()) { // ETH
          return getTokenPrice('bsc', '0x2170ed0880ac9a755fd29b2688956bd959f933f8', 18);
        } else if(address.toLowerCase() === '0xde3A24028580884448a5397872046a019649b084'.toLowerCase()) { // USDT
          return getTokenPrice('bsc', '0x55d398326f99059ff775485246999027b3197955', 18);
        } else if(address.toLowerCase() === '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc'.toLowerCase()) { // SUSHI
          return getTokenPrice('avax', '0x37B608519F91f70F2EeB0e5Ed9AF4061722e4F76', 18);
        } else if(address.toLowerCase() === '0x47536F17F4fF30e64A96a7555826b8f9e66ec468'.toLowerCase()) { // CRV
          return getTokenPrice('eth', '0xd533a949740bb3306d119cc777fa900ba034cd52', 18);
        } else if(address.toLowerCase() === '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'.toLowerCase()) { // renBTC
          return getTokenPrice('poly', '0xdbf31df14b66535af65aac99c32e9ea844e14501', 8);
        } else {
          console.error('Could not find price for Avalanche token:', address);
          return 0;
        }
      }

    // Checking Price of Harmony Chain Token:
    } else if(chain === 'one') {

      // Getting Price Data (Runs Once):
      if(oneTokenPrices.length === 0) {
        let tokenList = '';
        one_tokens.forEach(token => {
          tokenList += token.address + ',';
        });
        let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/harmony-shard-0?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
        let apiQuery_2 = 'https://api.coingecko.com/api/v3/simple/price?ids=harmony&vs_currencies=usd';
        try {
          let result_2 = await axios.get(apiQuery_2);
          oneTokenPrices.push({token: '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a', price: result_2.data.harmony.usd});
          let result = await axios.get(apiQuery);
          let tokens = Object.keys(result.data);
          tokens.forEach(token => {
            oneTokenPrices.push({token: token.toLowerCase(), price: result.data[token.toLowerCase()].usd});
          });
        } catch {
          console.error('CoinGecko API Error: Unable to fetch Harmony token prices.');
          return 0;
        }
      }

      // Finding Token Price in Data:
      if(address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') { address = '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'; }
      let token = oneTokenPrices.find(i => i.token === address.toLowerCase());
      if(token) {
        return token.price;
      } else {
        if(address.toLowerCase() === '0x224e64ec1bdce3870a6a6c777edd450454068fec'.toLowerCase()) { // UST
          return getTokenPrice('eth', '0xa47c8bf37f92abed4a126bda807a7b7498661acd', 18);
        } else if(address.toLowerCase() === '0x6983d1e6def3690c4d616b13597a09e6193ea013'.toLowerCase()) { // 1ETH
          return getTokenPrice('bsc', '0x2170ed0880ac9a755fd29b2688956bd959f933f8', 18);
        } else if(address.toLowerCase() === '0x783ee3e955832a3d52ca4050c4c251731c156020'.toLowerCase()) { // bscETH
          return getTokenPrice('bsc', '0x2170ed0880ac9a755fd29b2688956bd959f933f8', 18);
        } else if(address.toLowerCase() === '0x0ab43550a6915f9f67d0c454c2e90385e6497eaa'.toLowerCase()) { // bscBUSD
          return getTokenPrice('one', '0xe176ebe47d621b984a73036b9da5d834411ef734', 18);
        } else if(address.toLowerCase() === '0xb1f6e61e1e113625593a22fa6aa94f8052bc39e0'.toLowerCase()) { // bscBNB
          return getTokenPrice('bsc', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
        } else if(address.toLowerCase() === '0x44ced87b9f1492bf2dcf5c16004832569f7f6cba'.toLowerCase()) { // bscUSDC
          return getTokenPrice('bsc', '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', 18);
        } else if(address.toLowerCase() === '0x9a89d0e1b051640c6704dde4df881f73adfef39a'.toLowerCase()) { // bscUSDT
          return getTokenPrice('bsc', '0x55d398326f99059ff775485246999027b3197955', 18);
        } else if(address.toLowerCase() === '0x08cb2917245bbe75c8c9c6dc4a7b3765dae02b31'.toLowerCase()) { // bscDOT
          return getTokenPrice('bsc', '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', 18);
        } else if(address.toLowerCase() === '0x6e7be5b9b4c9953434cd83950d61408f1ccc3bee'.toLowerCase()) { // bscMATIC
          return getTokenPrice('poly', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
        } else if(address.toLowerCase() === '0x7a791e76bf4d4f3b9b492abb74e5108180be6b5a'.toLowerCase()) { // 1LINK
          return getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
        } else if(address.toLowerCase() === '0x352cd428efd6f31b5cae636928b7b84149cf369f'.toLowerCase()) { // 1CRV
          return getTokenPrice('eth', '0xD533a949740bb3306d119CC777fa900bA034cd52', 18);
        } else if(address.toLowerCase() === '0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8'.toLowerCase()) { // BIFI
          return getTokenPrice('bsc', '0xca3f508b8e4dd382ee878a314789373d80a5190a', 18);
        } else if(address.toLowerCase() === '0xe064a68994e9380250cfee3e8c0e2ac5c0924548'.toLowerCase()) { // xVIPER
          return getViperTokenPrice();
        } else {
          console.error('Could not find price for Harmony token:', address);
          return 0;
        }
      }
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
}