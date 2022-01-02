
// Required Packages:
const Terra = require('@terra-money/terra.js');
const axios = require('axios');

// Required Variables:
const { terra_tokens, terra_token_logos, terra_token_blacklist } = require('./tokens/terra.js');

// Initializations:
const addressPlaceholder = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
let terraTokenPrices = new Map();
const terra = new Terra.LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "columbus-5"
});

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
exports.query = async (query, description) => {
  try {
    return await query(terra); // query with the terra client (can't use method/args since the terra client has embedded methods. ex: terra.bank.balance)
  } catch {
    console.error(`ERROR: Calling Query [${description}] (Chain: TERRA)`);
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
    address: addressPlaceholder,
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
  let logo = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';

  // Terra Token:
  if (terra_token_logos.hasOwnProperty(symbol)) {
    logo = terra_token_logos[symbol];
  }

  return logo;
}

/* ========================================================================================================================================================================= */

// Promise to wait for token prices
let tokenPricePromise;

// Function to initialize token prices:
const initTokenPrices = async () => {
  if (!tokenPricePromise) {
    tokenPricePromise = (async () => {
      let tokenList = '';
      terra_tokens.forEach(token => {
        tokenList += token.address + ',';
      });
      let apiQuery = 'https://api.coingecko.com/api/v3/simple/token_price/terra?contract_addresses=' + tokenList.slice(0, -1) + '&vs_currencies=usd';
      let terraQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terra-luna&vs_currencies=usd';
      let ustQuery = 'https://api.coingecko.com/api/v3/simple/price?ids=terrausd&vs_currencies=usd';
      try {
        // Get Terra Price
        const terraPrice = (await axios.get(terraQuery)).data['terra-luna'].usd;

        // Get UST Price
        const ustPrice = (await axios.get(ustQuery)).data['terrausd'].usd;

        // Set Terra Price
        terraTokenPrices.set(addressPlaceholder + 'luna', terraPrice);

        // Set UST Price
        terraTokenPrices.set(addressPlaceholder + 'usd', ustPrice)

        // Set Other Native Token Prices
        const nativeCoinList = (await terra.bank.total())[0];
        let peggedAssetList = nativeCoinList.filter(coin => coin.denom.charAt(0) === 'u' && coin.denom.toLowerCase() !== 'uluna' && coin.denom.toLowerCase() !== 'uusd');
        await Promise.all(
          peggedAssetList.map(coin => {
            const decimals = 10 ** 6;
            coin.amount = decimals; // 1 unit
            return new Promise(async (resolve, reject) => {
              try {
                const ulunaRate = parseInt(await terra.market.swapRate(coin, 'uluna'));
                const usdRate = (ulunaRate * terraPrice) / decimals;
                terraTokenPrices.set(addressPlaceholder + coin.denom.slice(1), usdRate);
                resolve();
              } catch (err) {
                resolve();
                console.error(`Could not get swap rate for ${coin.denom} -> uluna`);
              }
            });
          })
        )

        // Set Contract Token Prices
        let result = await axios.get(apiQuery);
        let tokens = Object.keys(result.data);
        tokens.forEach(token => {
          terraTokenPrices.set(token.toLowerCase(), result.data[token].usd);
        });
      } catch {
        throw new Error("Could not initialize Terra token Prices...");
      }
    })();
  }
  await tokenPricePromise;
};

// Function to get a token's current price:
exports.getTokenPrice = async (address, symbol) => {

  try {

    // Getting Price Data (Runs Once):
    if (terraTokenPrices.size === 0) {
      await initTokenPrices();
    }

    // Finding Token Price in Data:
    let tokenPrice = terraTokenPrices.get((address + (symbol ?? '')).toLowerCase());
    if (tokenPrice) {
      return tokenPrice;
    } else {
      return 0;
    }
  } catch {
    return 0;
  }
}