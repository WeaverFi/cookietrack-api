
// Required Packages:
const Terra = require('@terra-money/terra.js');
const axios = require('axios');

// Required Variables:
const { terra_tokens, terra_token_logos, terra_token_blacklist } = require('./tokens/terra.js');

// Initializations:
const defaultTokenLogo = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';
const defaultAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
let terraTokenPrices = new Map();
let tokenPricesPromise;

// Setting Up Blockchain Connection:
const terra = new Terra.LCDClient({ URL: "https://lcd.terra.dev", chainID: "columbus-5" });

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
exports.query = async (query, description) => {
  try {
    let result = await query(terra);
    return result;
  } catch {
    console.error(`Calling ${description} (Chain: TERRA)`);
  }
};

/* ========================================================================================================================================================================= */

// Function to get native token info:
exports.addNativeToken = async (chain, balance, owner, symbol) => {

  // Initializing New Token:
  let newToken = {
    type: 'nativeToken',
    chain: chain,
    location: 'wallet',
    owner: owner,
    symbol: symbol ?? 'LUNA',
    address: defaultAddress,
    balance: balance / (10 ** 6),
    price: 0,
    logo: ''
  }

  // Getting Missing Token Info:
  newToken.logo = exports.getTokenLogo(newToken.symbol);
  newToken.price = await exports.getTokenPrice(newToken.address, symbol);

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
  let logo = defaultTokenLogo;

  // Terra Token:
  if(terra_token_logos.hasOwnProperty(symbol)) {
    logo = terra_token_logos[symbol];
  }

  return logo;
}

/* ========================================================================================================================================================================= */

// Function to get a token's current price:
exports.getTokenPrice = async (address, symbol) => {

  try {

    // Getting Price Data (Runs Once):
    if(terraTokenPrices.size === 0) {
      await fetchInitialTokenPrices();
    }

    // Finding Token Price in Data:
    let tokenPrice = terraTokenPrices.get((address + (symbol ?? '')).toLowerCase());
    if(tokenPrice) {
      return tokenPrice;
    } else {
      console.error(`TERRA: Token Price Not Found - ${address}`);
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
      let tokenList = '';
      terra_tokens.forEach(token => {
        tokenList += token.address + ',';
      });
      let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/terra?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
      let terraQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terra-luna&vs_currencies=usd';
      let ustQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terrausd&vs_currencies=usd';
      try {

        // LUNA:
        let terraPrice = (await axios.get(terraQuery)).data['terra-luna'].usd;
        terraTokenPrices.set(defaultAddress + 'luna', terraPrice);

        // UST:
        let ustPrice = (await axios.get(ustQuery)).data['terrausd'].usd;
        terraTokenPrices.set(defaultAddress + 'usd', ustPrice);

        // Other Native Tokens:
        let nativeTokens = (await terra.bank.total())[0];
        let peggedAssets = nativeTokens.filter(asset => asset.denom.charAt(0) === 'u' && asset.denom.toLowerCase() !== 'uluna' && asset.denom.toLowerCase() !== 'uusd');
        await Promise.all(
          peggedAssets.map(asset => {
            asset.amount = (10 ** 6);
            return new Promise(async (resolve, reject) => {
              try {
                let ulunaRate = parseInt(await terra.market.swapRate(asset, 'uluna'));
                let usdRate = (ulunaRate * terraPrice) / (10 ** 6);
                terraTokenPrices.set(defaultAddress + asset.denom.slice(1), usdRate);
                resolve();
              } catch {
                resolve();
                console.error(`TERRA: Native Token Price Not Found - ${asset.denom}`);
              }
            });
          })
        )

        // Other Tokens:
        let result = await axios.get(apiQuery);
        let tokens = Object.keys(result.data);
        tokens.forEach(token => {
          terraTokenPrices.set(token.toLowerCase(), result.data[token].usd);
        });
      } catch {
        console.error(`TERRA: Could not initialize token prices.`);
      }
    })();
  }
  await tokenPricesPromise;
};