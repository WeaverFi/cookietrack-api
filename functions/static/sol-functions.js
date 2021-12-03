
// Required Packages:
const web3 = require('@solana/web3.js');
const axios = require('axios');

// Required Variables:
const { sol_tokens, sol_token_logos, sol_token_blacklist } = require('./tokens/solana.js');

// Initializations:
let solTokenPrices = [];

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
exports.query = async (method, args) => {
  try {
    let sol = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');
    let result = await sol[method](...args);
    return result;
  } catch(err) {
    console.log(err);
    console.log(`ERROR: Calling ${method}(${args}) (Chain: SOL)`);
  }
}

/* ========================================================================================================================================================================= */

// Function to check if an address is a valid Solana wallet address:
exports.isAddress = async (address) => {
  let data = [false, 0];
  try {
    let wallet = new web3.PublicKey(address);
    let info = await exports.query('getParsedAccountInfo', [wallet]);
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

// Function to get native token info:
exports.addNativeToken = async (chain, balance, owner) => {

  // Initializing New Token:
  let newToken = {
    type: 'nativeToken',
    chain: chain,
    location: 'wallet',
    owner: owner,
    symbol: 'SOL',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    balance: balance / (10 ** 9),
    price: 0,
    logo: ''
  }

  // Getting Missing Token Info:
  newToken.logo = exports.getTokenLogo(newToken.symbol);
  newToken.price = await exports.getTokenPrice(newToken.address);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get token info:
exports.addToken = async (chain, location, address, symbol, decimals, balance, owner) => {
    
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: symbol,
    address: address,
    balance: balance / (10 ** decimals),
    price: 0,
    logo: ''
  }

  // Getting Missing Token Info:
  newToken.logo = exports.getTokenLogo(newToken.symbol);
  newToken.price = await exports.getTokenPrice(newToken.address);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
exports.getTokenLogo = (symbol) => {

  // Initializing Default Logo:
  let logo = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';

  // Solana Token:
  if(sol_token_logos.hasOwnProperty(symbol)) {
    logo = sol_token_logos[symbol];
  }

  return logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
exports.getTokenPrice = async (address) => {

  try {

    // Getting Price Data (Runs Once):
    if(solTokenPrices.length === 0) {
      let tokenList = '';
      sol_tokens.forEach(token => {
        tokenList += token.address + ',';
      });
      let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
      let solQuery = 'https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
      try {
        let solResult = await axios.get(solQuery);
        solTokenPrices.push({token: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', price: solResult.data.market_data.current_price.usd});
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