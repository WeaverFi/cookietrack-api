
// Required Packages:
const { ethers } = require('ethers');
const axios = require('axios');

// Required Variables:
const { rpcs } = require('./RPCs.js');
const { minABI, lpABI, aave, balancer, snowball, traderjoe, belt, alpaca, curve, iron, axial, mstable } = require('./ABIs.js');
const { ckey } = require('./keys.js');
const { eth_token_logos, eth_token_blacklist } = require('./tokens/ethereum.js');
const { bsc_token_logos, bsc_token_blacklist } = require('./tokens/bsc.js');
const { poly_token_logos, poly_token_blacklist } = require('./tokens/polygon.js');
const { ftm_token_logos, ftm_token_blacklist } = require('./tokens/fantom.js');
const { avax_token_logos, avax_token_blacklist } = require('./tokens/avalanche.js');
const { one_token_logos, one_token_blacklist } = require('./tokens/harmony.js');

// Initializations:
const defaultTokenLogo = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@d5c68edec1f5eaec59ac77ff2b48144679cebca1/32/icon/generic.png';

/* ========================================================================================================================================================================= */

// Function to make blockchain queries:
exports.query = async (chain, address, abi, method, args) => {
  try {
    let ethers_provider = new ethers.providers.JsonRpcProvider(rpcs[chain]);
    let contract = new ethers.Contract(address, abi, ethers_provider);
    let result = await contract[method](...args);
    return result;
  } catch {
    try {
      let ethers_provider = new ethers.providers.JsonRpcProvider(rpcs.backups[chain]);
      let contract = new ethers.Contract(address, abi, ethers_provider);
      let result = await contract[method](...args);
      return result;
    } catch {
      console.error(`Calling ${method}(${args}) on ${address} (Chain: ${chain.toUpperCase()})`);
    }
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
    symbol: '',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    balance: balance / (10 ** 18),
    price: 0,
    logo: ''
  }

  // Assigning Token Symbol:
  switch(chain) {
    case 'eth':
      newToken.symbol = 'ETH';
      break;
    case 'bsc':
      newToken.symbol = 'BNB';
      break;
    case 'poly':
      newToken.symbol = 'MATIC';
      break;
    case 'ftm':
      newToken.symbol = 'FTM';
      break;
    case 'avax':
      newToken.symbol = 'AVAX';
      break;
    case 'one':
      newToken.symbol = 'ONE';
      break;
  }

  // Getting Missing Token Info:
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
  newToken.price = await exports.getTokenPrice(chain, newToken.address, 18);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get token info:
exports.addToken = async (chain, location, address, balance, owner) => {
    
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }

  // Initializing Decimals:
  let decimals = 18;

  // Native Tokens:
  if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    switch(chain) {
      case 'eth':
        newToken.symbol = 'ETH';
        break;
      case 'bsc':
        newToken.symbol = 'BNB';
        break;
      case 'poly':
        newToken.symbol = 'MATIC';
        break;
      case 'ftm':
        newToken.symbol = 'FTM';
        break;
      case 'avax':
        newToken.symbol = 'AVAX';
        break;
      case 'one':
        newToken.symbol = 'ONE';
        break;
    }

  // Other tokens:
  } else {
    newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
    decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  }

  // Getting Missing Token Info:
  newToken.balance = balance / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
  newToken.price = await exports.getTokenPrice(chain, address, decimals);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get LP token info:
exports.addLPToken = async (chain, location, address, balance, owner) => {
      
  // Initializing New Token:
  let newToken = {
    type: 'lpToken',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
    token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
  }

  // LP Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let lpTokenReserves = await exports.query(chain, address, lpABI, 'getReserves', []);
  let lpTokenSupply = await exports.query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);

  // First Paired Token:
  newToken.token0.address = await exports.query(chain, address, lpABI, 'token0', []);
  let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
  let supply0 = lpTokenReserves[0] / (10 ** decimals);
  newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
  newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
  newToken.token0.balance = (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0);
  newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

  // Second Paired Token:
  newToken.token1.address = await exports.query(chain, address, lpABI, 'token1', []);
  let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
  let supply1 = lpTokenReserves[1] / (10 ** decimals);
  newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
  newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
  newToken.token1.balance = (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1);
  newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get debt token info:
exports.addDebtToken = async (chain, location, address, balance, owner) => {

  // Initializing New Token:
  let newToken = {
    type: 'debt',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }

  // Initializing Decimals:
  let decimals = 18;

  // Native Tokens:
  if(address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    switch(chain) {
      case 'eth':
        newToken.symbol = 'ETH';
        break;
      case 'bsc':
        newToken.symbol = 'BNB';
        break;
      case 'poly':
        newToken.symbol = 'MATIC';
        break;
      case 'ftm':
        newToken.symbol = 'FTM';
        break;
      case 'avax':
        newToken.symbol = 'AVAX';
        break;
      case 'one':
        newToken.symbol = 'ONE';
        break;
    }

  // Other tokens:
  } else {
    newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
    decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  }

  // Getting Missing Token Info:
  newToken.balance = balance / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
  newToken.price = await exports.getTokenPrice(chain, address, decimals);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get a token's logo:
exports.getTokenLogo = (chain, symbol) => {

  // Initializing Default Logo:
  let logo = defaultTokenLogo;

  // Ethereum Token:
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
exports.getTokenPrice = async (chain, address, decimals) => {

  // Initializations:
  let chains = {
    eth: { id: 1, cgID: 'ethereum', nativeID: 'ethereum', usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', usdcDecimals: 6, inch: true, paraswap: true },
    bsc: { id: 56, cgID: 'binance-smart-chain', nativeID: 'binancecoin', usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', usdcDecimals: 18, inch: true, paraswap: true },
    poly: { id: 137, cgID: 'polygon-pos', nativeID: 'matic-network', usdc: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', usdcDecimals: 6, inch: true, paraswap: true },
    ftm: { id: 250, cgID: 'fantom', nativeID: 'fantom', usdc: '0x04068da6c83afcfa0e13ba15a6696662335d5b75', usdcDecimals: 6, inch: false, paraswap: false },
    avax: { id: 43114, cgID: 'avalanche', nativeID: 'avalanche-2', usdc: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', usdcDecimals: 6, inch: false, paraswap: true },
    one: { id: 1666600000, cgID: 'harmony-shard-0', nativeID: 'harmony', usdc: '0x985458e523db3d53125813ed68c274899e9dfab4', usdcDecimals: 6, inch: false, paraswap: false }
  };
  let priceFound = false;

  // Fetching CoinGecko Price:
  let apiQuery = '';
  if(address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
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
      let apiQuery = `https://api.1inch.exchange/v3.0/${chains[chain].id}/quote?fromTokenAddress=${address}&toTokenAddress=${chains[chain].usdc}&amount=${10 ** decimals}`;
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
      let apiQuery = `https://apiv5.paraswap.io/prices?srcToken=${address}&srcDecimals=${decimals}&destToken=${chains[chain].usdc}&destDecimals=${chains[chain].usdcDecimals}&amount=${10 ** decimals}&side=SELL&network=${chains[chain].id}`;
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
      return exports.getTokenPrice('eth', '0xc581b735a1688071a1746c968e0798d642ede491', 6);
    }
  }

  // Fantom Redirections:
  if(chain === 'ftm') {
    if(address.toLowerCase() === '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8'.toLowerCase()) { // LINK
      return exports.getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
    } else if(address.toLowerCase() === '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'.toLowerCase()) { // DAI
      return exports.getTokenPrice('eth', '0x6b175474e89094c44da98b954eedeac495271d0f', 18);
    } else if(address.toLowerCase() === '0x049d68029688eabf473097a2fc38ef61633a3c7a'.toLowerCase()) { // fUSDT
      return exports.getTokenPrice('eth', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6);
    } else if(address.toLowerCase() === '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'.toLowerCase()) { // renBTC
      return exports.getTokenPrice('eth', '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', 8);
    } else if(address.toLowerCase() === '0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50'.toLowerCase()) { // BUSD
      return exports.getTokenPrice('bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18);
    } else if(address.toLowerCase() === '0x3D8f1ACCEe8e263F837138829B6C4517473d0688'.toLowerCase()) { // fWINGS
      return exports.getTokenPrice('bsc', '0x0487b824c8261462f88940f97053e65bdb498446', 18);
    }
  }

  // Harmony Redirections:
  if(chain === 'one') {
    if(address.toLowerCase() === '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'.toLowerCase()) { // WONE
      return exports.getTokenPrice('one', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
    } else if(address.toLowerCase() === '0x224e64ec1bdce3870a6a6c777edd450454068fec'.toLowerCase()) { // UST
      return exports.getTokenPrice('eth', '0xa47c8bf37f92abed4a126bda807a7b7498661acd', 18);
    } else if(address.toLowerCase() === '0x783ee3e955832a3d52ca4050c4c251731c156020'.toLowerCase()) { // bscETH
      return exports.getTokenPrice('eth', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
    } else if(address.toLowerCase() === '0x0ab43550a6915f9f67d0c454c2e90385e6497eaa'.toLowerCase()) { // bscBUSD
      return exports.getTokenPrice('bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18);
    } else if(address.toLowerCase() === '0x44ced87b9f1492bf2dcf5c16004832569f7f6cba'.toLowerCase()) { // bscUSDC
      return 1;
    } else if(address.toLowerCase() === '0x9a89d0e1b051640c6704dde4df881f73adfef39a'.toLowerCase()) { // bscUSDT
      return exports.getTokenPrice('eth', '0xdac17f958d2ee523a2206206994597c13d831ec7', 6);
    } else if(address.toLowerCase() === '0x08cb2917245bbe75c8c9c6dc4a7b3765dae02b31'.toLowerCase()) { // bscDOT
      return exports.getTokenPrice('bsc', '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', 18);
    } else if(address.toLowerCase() === '0x6e7be5b9b4c9953434cd83950d61408f1ccc3bee'.toLowerCase()) { // bscMATIC
      return exports.getTokenPrice('poly', '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 18);
    } else if(address.toLowerCase() === '0x7a791e76bf4d4f3b9b492abb74e5108180be6b5a'.toLowerCase()) { // 1LINK
      return exports.getTokenPrice('eth', '0x514910771af9ca656af840dff83e8264ecf986ca', 18);
    } else if(address.toLowerCase() === '0x352cd428efd6f31b5cae636928b7b84149cf369f'.toLowerCase()) { // 1CRV
      return exports.getTokenPrice('eth', '0xD533a949740bb3306d119CC777fa900bA034cd52', 18);
    }
  }

  // Logging tokens with no working price feed for debugging purposes:
  console.error(chain.toUpperCase() + ': Token Price Not Found -', address);

  return 0;
}

/* ========================================================================================================================================================================= */

// Function to get the transaction history of a wallet address:
exports.getTXs = async (chain, address, last50) => {

  // Initializations:
  let txs = [];
  let page = 0;
  let hasNextPage = false;
  let chains = {
    eth: { id: 1, token: 'ETH', blacklist: eth_token_blacklist },
    bsc: { id: 56, token: 'BNB', blacklist: bsc_token_blacklist },
    poly: { id: 137, token: 'MATIC', blacklist: poly_token_blacklist },
    ftm: { id: 250, token: 'FTM', blacklist: ftm_token_blacklist },
    avax: { id: 43114, token: 'AVAX', blacklist: avax_token_blacklist }
  }
  let nullEventNativeSwapTXs = [];

  // Fetching TXs:
  do {
    let response = (await axios.get(`https://api.covalenthq.com/v1/${chains[chain].id}/address/${address}/transactions_v2/?page-size=${last50 ? 50 : 1000}&page-number=${page++}&key=${ckey}`)).data;
    if(!response.error) {
      last50 ? hasNextPage = false : hasNextPage = response.data.pagination.has_more;
      let promises = response.data.items.map(tx => (async () => {
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
                address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                symbol: chains[chain].token,
                logo: exports.getTokenLogo(chain, chains[chain].token)
              },
              value: parseInt(tx.value) / (10 ** 18),
              fee: (tx.gas_spent * tx.gas_price) / (10 ** 18),
              nativeToken: chains[chain].token
            });

          // Approval TXs:
          } else if(tx.log_events.length < 3) {
            tx.log_events.forEach(event => {
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
                        logo: exports.getTokenLogo(chain, event.sender_contract_ticker_symbol)
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
          tx.log_events.forEach(event => {
            if(event.decoded != null) {

              // Token Transfers:
              if(event.decoded.name === 'Transfer') {

                // Filtering Blacklisted Tokens:
                if(!chains[chain].blacklist.includes(event.sender_address.toLowerCase()) && event.sender_contract_ticker_symbol != null) {

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
                          logo: exports.getTokenLogo(chain, event.sender_contract_ticker_symbol)
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
                          logo: exports.getTokenLogo(chain, event.sender_contract_ticker_symbol)
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
                let nullEvent = tx.log_events.find(event => event.decoded === null);
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
                          address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                          symbol: chains[chain].token,
                          logo: exports.getTokenLogo(chain, chains[chain].token)
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
                      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                      symbol: chains[chain].token,
                      logo: exports.getTokenLogo(chain, chains[chain].token)
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
  } while(hasNextPage);

  return txs;
}

/* ========================================================================================================================================================================= */

// Function to get the simple/quick transaction history of a wallet address:
exports.getSimpleTXs = async (chain, address) => {

  // Initializations:
  let txs = [];
  let page = 0;
  let hasNextPage = false;
  let chains = {
    eth: { id: 1, token: 'ETH' },
    bsc: { id: 56, token: 'BNB' },
    poly: { id: 137, token: 'MATIC' },
    ftm: { id: 250, token: 'FTM' },
    avax: { id: 43114, token: 'AVAX' }
  }

  // Fetching TXs:
  do {
    let response = (await axios.get(`https://api.covalenthq.com/v1/${chains[chain].id}/address/${address}/transactions_v2/?no-logs=true&page-size=1000&page-number=${page++}&key=${ckey}`)).data;
    if(!response.error) {
      hasNextPage = response.data.pagination.has_more;
      let promises = response.data.items.map(tx => (async () => {
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
  } while(hasNextPage);

  return txs;
}

/* ========================================================================================================================================================================= */

// Function to get S4D token info:
exports.addS4DToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let controller = await exports.query(chain, address, snowball.s4dABI, 'owner', []);
  newToken.price = parseInt(await exports.query(chain, controller, snowball.s4dControllerABI, 'getVirtualPrice', [])) / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Trader Joe token info (xJOE):
exports.addTraderJoeToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }

  // Getting Missing Token Info:
  let underlyingToken = await exports.query(chain, address, traderjoe.joeABI, 'joe', []);
  let joeStaked = parseInt(await exports.query(chain, underlyingToken, minABI, 'balanceOf', [address]));
  let xjoeSupply = parseInt(await exports.query(chain, address, minABI, 'totalSupply', []));
  let multiplier = joeStaked / xjoeSupply;
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  newToken.price = multiplier * (await exports.getTokenPrice(chain, underlyingToken, decimals));
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
  
  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Aave BLP token info:
exports.addAaveBLPToken = async (chain, location, address, balance, owner) => {

  // Getting actual address:
  let actualAddress = await exports.query(chain, address, aave.lpABI, 'bPool', []);
    
  // Initializing New Token:
  let newToken = {
    type: 'lpToken',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: actualAddress,
    balance: 0,
    token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
    token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
  }

  // LP Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let lpTokenSupply = await exports.query(chain, actualAddress, balancer.tokenABI, 'totalSupply', []) / (10 ** decimals);
  let lpTokenAddresses = await exports.query(chain, actualAddress, balancer.tokenABI, 'getCurrentTokens', []);

  // First Paired Token:
  newToken.token0.address = lpTokenAddresses[0];
  let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
  let supply0 = await exports.query(chain, actualAddress, balancer.tokenABI, 'getBalance', [newToken.token0.address]) / (10 ** decimals);
  newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
  newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
  newToken.token0.balance = supply0 * (balance / lpTokenSupply);
  newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

  // Second Paired Token:
  newToken.token1.address = lpTokenAddresses[1];
  let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
  let supply1 = await exports.query(chain, actualAddress, balancer.tokenABI, 'getBalance', [newToken.token1.address]) / (10 ** decimals);
  newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
  newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
  newToken.token1.balance = supply1 * (balance / lpTokenSupply);
  newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get 4Belt token info:
exports.add4BeltToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '4Belt',
    address: address,
    balance: 0,
    price: 1,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Belt token info:
exports.addBeltToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let multiplier = parseInt(await exports.query(chain, address, belt.tokenABI, 'getPricePerFullShare', [])) / (10 ** decimals);
  let underlyingToken = await exports.query(chain, address, belt.tokenABI, 'token', []);
  newToken.price = multiplier * (await exports.getTokenPrice(chain, underlyingToken, decimals));
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Alpaca token info:
exports.addAlpacaToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let totalToken = parseInt(await exports.query(chain, address, alpaca.tokenABI, 'totalToken', []));
  let totalSupply = parseInt(await exports.query(chain, address, minABI, 'totalSupply', []));
  let multiplier = totalToken / totalSupply;
  let underlyingToken = await exports.query(chain, address, alpaca.tokenABI, 'token', []);
  newToken.price = multiplier * (await exports.getTokenPrice(chain, underlyingToken, decimals));
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Curve token info:
exports.addCurveToken = async (chain, location, address, balance, owner) => {
  
  // Ethereum Token:
  if(chain === 'eth') {
    let registry = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';
    let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
    let actualBalance = balance / (10 ** decimals);
    let symbol = await exports.query(chain, address, minABI, 'symbol', []);
    let lpTokenSupply = await exports.query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
    let poolAddress = await exports.query(chain, registry, curve.registryABI, 'get_pool_from_lp_token', [address]);
    let tokens = (await exports.query(chain, registry, curve.registryABI, 'get_underlying_coins', [poolAddress])).filter(token => token != '0x0000000000000000000000000000000000000000');
    let reserves = (await exports.query(chain, registry, curve.registryABI, 'get_underlying_balances', [poolAddress])).filter(balance => balance != 0);
    let multiplier = parseInt(await exports.query(chain, registry, curve.registryABI, 'get_virtual_price_from_lp_token', [address])) / (10 ** decimals);

    // Function to redirect synthetic asset price fetching:
    const getPrice = async (chain, address, decimals) => {
      if(address.toLowerCase() === '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6'.toLowerCase()) { // sLINK
        return await exports.getTokenPrice(chain, '0x514910771af9ca656af840dff83e8264ecf986ca', decimals);
      } else if(address.toLowerCase() === '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6'.toLowerCase()) { // sBTC
        return await exports.getTokenPrice(chain, '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimals);
      } else if(address.toLowerCase() === '0xd71ecff9342a5ced620049e616c5035f1db98620'.toLowerCase()) { // sEUR
        return await exports.getTokenPrice(chain, '0xdb25f211ab05b1c97d595516f45794528a807ad8', decimals);
      } else {
        return await exports.getTokenPrice(chain, address, decimals);
      }
    }

    // 3+ Asset Tokens:
    if(tokens.length > 2) {

      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: symbol,
        address: address,
        balance: actualBalance,
        price: 0,
        logo: ''
      }

      // Getting Missing Token Info:
      let priceSum = 0;
      for(let i = 0; i < tokens.length; i++) {
        let tokenDecimals = parseInt(await exports.query(chain, tokens[i], minABI, 'decimals', []));
        let tokenPrice = await getPrice(chain, tokens[i], tokenDecimals);
        priceSum += (parseInt(reserves[i]) / (10 ** tokenDecimals)) * tokenPrice;
      }
      priceSum /= lpTokenSupply;
      priceSum *= multiplier;
      newToken.price = priceSum;
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

      return newToken;

    // Standard LP Tokens:
    } else if(tokens.length === 2) {

      // Initializing New Token:
      let newToken = {
        type: 'lpToken',
        chain: chain,
        location: location,
        owner: owner,
        symbol: symbol,
        address: address,
        balance: actualBalance,
        token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
        token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
      }

      // First Paired Token:
      if(tokens[0].toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        newToken.token0.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        newToken.token0.symbol = 'ETH';
        newToken.token0.price = await getPrice(chain, newToken.token0.address, 18);
        newToken.token0.balance = parseInt(reserves[0]) * ((newToken.balance / (10 ** 18)) / lpTokenSupply);
        newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);
      } else {
        newToken.token0.address = tokens[0];
        newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
        let tokenDecimals = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
        newToken.token0.price = await getPrice(chain, newToken.token0.address, tokenDecimals);
        newToken.token0.balance = parseInt(reserves[0]) * ((newToken.balance / lpTokenSupply) / (10 ** decimals));
        newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);
      }

      // Second Paired Token:
      if(tokens[1].toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        newToken.token1.address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
        newToken.token1.symbol = 'ETH';
        newToken.token1.price = await getPrice(chain, newToken.token1.address, 18);
        newToken.token1.balance = parseInt(reserves[1]) * ((newToken.balance / (10 ** 18)) / lpTokenSupply);
        newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);
      } else {
        newToken.token1.address = tokens[1];
        newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
        let tokenDecimals = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
        newToken.token1.price = await getPrice(chain, newToken.token1.address, tokenDecimals);
        newToken.token1.balance = parseInt(reserves[1]) * ((newToken.balance / lpTokenSupply) / (10 ** decimals));
        newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);
      }

      return newToken;
    }

  // Polygon Token:
  } else if(chain === 'poly') {
    
    // crvUSDBTCETH (Atricrypto V3):
    if(address.toLowerCase() === '0xdAD97F7713Ae9437fa9249920eC8507e5FbB23d3'.toLowerCase()) {

      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
      let lpTokenSupply = await exports.query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.polyTokenABI, 'minter', []);
      let multiplier = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      // 1st Token Info:
      let address0 = await exports.query(chain, minter, curve.minterABI, 'coins', [0]);
      let token0 = await exports.addCurveToken(chain, location, address0, 0, address);
      let supply0 = parseInt(await exports.query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** 18);
      let price0 = token0.price;

      // 2nd Token Info:
      let address1 = await exports.query(chain, minter, curve.minterABI, 'coins', [1]);
      let token1 = await exports.query(chain, address1, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals1 = parseInt(await exports.query(chain, token1, minABI, 'decimals', []));
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals1);
      let price1 = await exports.getTokenPrice(chain, token1, decimals1);

      // 3rd Token Info:
      let address2 = await exports.query(chain, minter, curve.minterABI, 'coins', [2]);
      let token2 = await exports.query(chain, address2, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals2 = parseInt(await exports.query(chain, token2, minABI, 'decimals', []));
      let supply2 = await exports.query(chain, minter, curve.minterABI, 'balances', [2]) / (10 ** decimals2);
      let price2 = await exports.getTokenPrice(chain, token2, decimals2);

      // Calculating Token Price:
      newToken.price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return newToken;

    // am3CRV (Aave):
    } else if(address.toLowerCase() === '0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171'.toLowerCase()) {

      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // Getting Missing Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let minter = await exports.query(chain, address, curve.polyTokenABI, 'minter', []);
      newToken.price = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

      return newToken;

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0xf8a57c1d3b9629b77b6726a042ca48990A84Fb49'.toLowerCase()) {

      // Initializing New Token:
      let newToken = {
        type: 'lpToken',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
        token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let lpTokenSupply = await exports.query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.polyTokenABI, 'minter', []);

      // First Paired Token:
      newToken.token0.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [0]);
      newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
      let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
      newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
      let supply0 = await exports.query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      newToken.token0.balance = (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0);
      newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

      // Second Paired Token:
      newToken.token1.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [1]);
      newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
      let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
      newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);
      newToken.token1.balance = (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1);
      newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

      return newToken;

    // crvEURTUSD (EURtUSD):
    } else if(address.toLowerCase() === '0x600743B1d8A96438bD46836fD34977a00293f6Aa'.toLowerCase()) {

      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
      let lpTokenSupply = await exports.query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.polyTokenABI, 'minter', []);
      let multiplier = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      // 1st Token Info:
      let token0 = await exports.query(chain, minter, curve.minterABI, 'coins', [0]);
      let decimals0 = parseInt(await exports.query(chain, token0, minABI, 'decimals', []));
      let supply0 = await exports.query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals0);
      let price0 = await exports.getTokenPrice(chain, token0, decimals0);

      // 2nd Token Info:
      let address1 = await exports.query(chain, minter, curve.minterABI, 'coins', [1]);
      let token1 = await exports.addCurveToken(chain, location, address1, 0, address);
      let supply1 = parseInt(await exports.query(chain, minter, curve.minterABI, 'balances', [1])) / (10 ** 18);
      let price1 = token1.price;

      // Calculating Token Price:
      newToken.price = multiplier * (((supply0 * price0) + (supply1 * price1)) / lpTokenSupply);

      return newToken;
    }

  // Fantom Token:
  } else if(chain === 'ftm') {
    
    // DAI+USDC (2pool):
    if(address.toLowerCase() === '0x27E611FD27b276ACbd5Ffd632E5eAEBEC9761E40'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'lpToken',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
        token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let lpTokenSupply = await exports.query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);

      // First Paired Token:
      newToken.token0.address = await exports.query(chain, address, curve.ftmTokenABI, 'coins', [0]);
      newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
      let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
      newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
      let supply0 = await exports.query(chain, address, curve.ftmTokenABI, 'balances', [0]) / (10 ** decimals);
      newToken.token0.balance = (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0);
      newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

      // Second Paired Token:
      newToken.token1.address = await exports.query(chain, address, curve.ftmTokenABI, 'coins', [1]);
      newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
      let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
      newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
      let supply1 = await exports.query(chain, address, curve.ftmTokenABI, 'balances', [1]) / (10 ** decimals);
      newToken.token1.balance = (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1);
      newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

      return newToken;

    // fUSDT+DAI+USDC (fUSDT):
    } else if(address.toLowerCase() === '0x92D5ebF3593a92888C25C0AbEF126583d4b5312E'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: 'fUSDTCRV',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // Getting Missing Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.price = parseInt(await exports.query(chain, address, curve.ftmTokenABI, 'get_virtual_price', [])) / (10 ** decimals);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

      return newToken;

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'lpToken',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
        token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let lpTokenSupply = await exports.query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.ftmTokenABI, 'minter', []);

      // First Paired Token:
      newToken.token0.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [0]);
      newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
      let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
      newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
      let supply0 = await exports.query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      newToken.token0.balance = (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0);
      newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

      // Second Paired Token:
      newToken.token1.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [1]);
      newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
      let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
      newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);
      newToken.token1.balance = (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1);
      newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

      return newToken;

    // crv3crypto (Tricrypto):
    } else if(address.toLowerCase() === '0x58e57cA18B7A47112b877E31929798Cd3D703b0f'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
      let lpTokenSupply = await exports.query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.ftmTokenABI, 'minter', []);
      let multiplier = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      // 1st Token Info:
      let token0 = await exports.query(chain, minter, curve.minterABI, 'coins', [0]);
      let decimals0 = parseInt(await exports.query(chain, token0, minABI, 'decimals', []));
      let supply0 = await exports.query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals0);
      let price0 = await exports.getTokenPrice(chain, token0, decimals0);

      // 2nd Token Info:
      let token1 = await exports.query(chain, minter, curve.minterABI, 'coins', [1]);
      let decimals1 = parseInt(await exports.query(chain, token1, minABI, 'decimals', []));
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals1);
      let price1 = await exports.getTokenPrice(chain, token1, decimals1);

      // 3rd Token Info:
      let token2 = await exports.query(chain, minter, curve.minterABI, 'coins', [2]);
      let decimals2 = parseInt(await exports.query(chain, token2, minABI, 'decimals', []));
      let supply2 = await exports.query(chain, minter, curve.minterABI, 'balances', [2]) / (10 ** decimals2);
      let price2 = await exports.getTokenPrice(chain, token2, decimals2);

      // Calculating Token Price:
      newToken.price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return newToken;

    // g3CRV (Geist):
    } else if(address.toLowerCase() === '0xD02a30d33153877BC20e5721ee53DeDEE0422B2F'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // Getting Missing Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let minter = await exports.query(chain, address, curve.ftmTokenABI, 'minter', []);
      newToken.price = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

      return newToken;
    }

  // Avalanche Token:
  } else if(chain === 'avax') {
    
    // crvUSDBTCETH (Atricrypto V2):
    if(address.toLowerCase() === '0x1daB6560494B04473A0BE3E7D83CF3Fdf3a51828'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);
      let lpTokenSupply = await exports.query(chain, address, minABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.avaxTokenABI, 'minter', []);
      let multiplier = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);

      // 1st Token Info:
      let address0 = await exports.query(chain, minter, curve.minterABI, 'coins', [0]);
      let token0 = await exports.addCurveToken(chain, location, address0, 0, address);
      let supply0 = parseInt(await exports.query(chain, minter, curve.minterABI, 'balances', [0])) / (10 ** 18);
      let price0 = token0.price;

      // 2nd Token Info:
      let address1 = await exports.query(chain, minter, curve.minterABI, 'coins', [1]);
      let token1 = await exports.query(chain, address1, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals1 = parseInt(await exports.query(chain, token1, minABI, 'decimals', []));
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals1);
      let price1 = await exports.getTokenPrice(chain, token1, decimals1);

      // 3rd Token Info:
      let address2 = await exports.query(chain, minter, curve.minterABI, 'coins', [2]);
      let token2 = await exports.query(chain, address2, curve.intermediaryABI, 'UNDERLYING_ASSET_ADDRESS', []);
      let decimals2 = parseInt(await exports.query(chain, token2, minABI, 'decimals', []));
      let supply2 = await exports.query(chain, minter, curve.minterABI, 'balances', [2]) / (10 ** decimals2);
      let price2 = await exports.getTokenPrice(chain, token2, decimals2);

      // Calculating Token Price:
      newToken.price = multiplier * (((supply0 * price0) + (supply1 * price1) + (supply2 * price2)) / lpTokenSupply);

      return newToken;

    // am3CRV (Aave):
    } else if(address.toLowerCase() === '0x1337BedC9D22ecbe766dF105c9623922A27963EC'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'token',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        price: 0,
        logo: ''
      }

      // Getting Missing Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let minter = await exports.query(chain, address, curve.avaxTokenABI, 'minter', []);
      newToken.price = parseInt(await exports.query(chain, minter, curve.minterABI, 'get_virtual_price', [])) / (10 ** decimals);
      newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

      return newToken;

    // btcCRV (Ren):
    } else if(address.toLowerCase() === '0xC2b1DF84112619D190193E48148000e3990Bf627'.toLowerCase()) {
      
      // Initializing New Token:
      let newToken = {
        type: 'lpToken',
        chain: chain,
        location: location,
        owner: owner,
        symbol: '',
        address: address,
        balance: 0,
        token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
        token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
      }

      // LP Token Info:
      let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
      newToken.balance = balance / (10 ** decimals);
      newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
      let lpTokenSupply = await exports.query(chain, address, lpABI, 'totalSupply', []) / (10 ** decimals);
      let minter = await exports.query(chain, address, curve.avaxTokenABI, 'minter', []);

      // First Paired Token:
      newToken.token0.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [0]);
      newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
      let decimals0 = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
      newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, decimals0);
      let supply0 = await exports.query(chain, minter, curve.minterABI, 'balances', [0]) / (10 ** decimals);
      newToken.token0.balance = (supply0 * (balance / lpTokenSupply)) / (10 ** decimals0);
      newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

      // Second Paired Token:
      newToken.token1.address = await exports.query(chain, minter, curve.minterABI, 'underlying_coins', [1]);
      newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
      let decimals1 = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
      newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, decimals1);
      let supply1 = await exports.query(chain, minter, curve.minterABI, 'balances', [1]) / (10 ** decimals);
      newToken.token1.balance = (supply1 * (balance / lpTokenSupply)) / (10 ** decimals1);
      newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

      return newToken;
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
exports.addBZXToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let multiplier = parseInt(await exports.query(chain, address, bzx.tokenABI, 'tokenPrice', [])) / (10 ** decimals);
  let underlyingToken = await exports.query(chain, address, bzx.tokenABI, 'loanTokenAddress', []);
  newToken.price = multiplier * (await exports.getTokenPrice(chain, underlyingToken, decimals));
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Balancer LP token info:
exports.addBalancerToken = async (chain, location, address, balance, owner, id) => {

  // Getting LP Token Info:
  let vault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
  let poolInfo = await exports.query(chain, vault, balancer.vaultABI, 'getPoolTokens', [id]);
  let symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  let actualBalance = balance / (10 ** decimals);
  let lpTokenSupply = parseInt(await exports.query(chain, address, minABI, 'totalSupply', []));

  // 3+ Asset Tokens:
  if(poolInfo.tokens.length > 2) {
    
    // Initializing New Token:
    let newToken = {
      type: 'token',
      chain: chain,
      location: location,
      owner: owner,
      symbol: symbol,
      address: address,
      balance: actualBalance,
      price: 0,
      logo: ''
    }

    // Getting Missing Token Info:
    let priceSum = 0;
    for(let i = 0; i < poolInfo.tokens.length; i++) {
      let tokenDecimals = parseInt(await exports.query(chain, poolInfo.tokens[i], minABI, 'decimals', []));
      let tokenPrice = await exports.getTokenPrice(chain, poolInfo.tokens[i], tokenDecimals);
      priceSum += (parseInt(poolInfo.balances[i]) / (10 ** tokenDecimals)) * tokenPrice;
    }
    newToken.price = priceSum / (lpTokenSupply / (10 ** decimals));
    newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

    return newToken;

  // Standard LP Tokens:
  } else if(poolInfo.tokens.length === 2) {
    
    // Initializing New Token:
    let newToken = {
      type: 'lpToken',
      chain: chain,
      location: location,
      owner: owner,
      symbol: symbol,
      address: address,
      balance: actualBalance,
      token0: { symbol: '', address: '', balance: 0, price: 0, logo: '' },
      token1: { symbol: '', address: '', balance: 0, price: 0, logo: '' }
    }

    // First Paired Token:
    newToken.token0.address = poolInfo.tokens[0];
    newToken.token0.symbol = await exports.query(chain, newToken.token0.address, minABI, 'symbol', []);
    let tokenDecimals = parseInt(await exports.query(chain, newToken.token0.address, minABI, 'decimals', []));
    newToken.token0.price = await exports.getTokenPrice(chain, newToken.token0.address, tokenDecimals);
    newToken.token0.balance = parseInt(reserves[0]) * ((newToken.balance / (10 ** decimals)) / lpTokenSupply);
    newToken.token0.logo = exports.getTokenLogo(chain, newToken.token0.symbol);

    // Second Paired Token:
    newToken.token1.address = poolInfo.tokens[1];
    newToken.token1.symbol = await exports.query(chain, newToken.token1.address, minABI, 'symbol', []);
    tokenDecimals = parseInt(await exports.query(chain, newToken.token1.address, minABI, 'decimals', []));
    newToken.token1.price = await exports.getTokenPrice(chain, newToken.token1.address, tokenDecimals);
    newToken.token1.balance = parseInt(reserves[1]) * ((newToken.balance / (10 ** decimals)) / lpTokenSupply);
    newToken.token1.logo = exports.getTokenLogo(chain, newToken.token1.symbol);

    return newToken;
  }
}

/* ========================================================================================================================================================================= */

// Function to get Iron token info:
exports.addIronToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let swapAddress = await exports.query(chain, address, iron.tokenABI, 'swap', []);
  newToken.price = parseInt(await exports.query(chain, swapAddress, iron.swapABI, 'getVirtualPrice', [])) / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get Axial token info:
exports.addAxialToken = async (chain, location, address, balance, owner) => {
  
  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }
  
  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  let swapAddress = await exports.query(chain, address, axial.tokenABI, 'owner', []);
  newToken.price = parseInt(await exports.query(chain, swapAddress, axial.swapABI, 'getVirtualPrice', [])) / (10 ** decimals);
  newToken.logo = exports.getTokenLogo(chain, newToken.symbol);

  return newToken;
}

/* ========================================================================================================================================================================= */

// Function to get mStable token info:
exports.addStableToken = async (chain, location, address, balance, owner) => {

  // Initializing New Token:
  let newToken = {
    type: 'token',
    chain: chain,
    location: location,
    owner: owner,
    symbol: '',
    address: address,
    balance: 0,
    price: 0,
    logo: ''
  }

  // Getting Missing Token Info:
  let decimals = parseInt(await exports.query(chain, address, minABI, 'decimals', []));
  newToken.balance = balance / (10 ** decimals);
  newToken.symbol = await exports.query(chain, address, minABI, 'symbol', []);
  newToken.price = parseInt((await exports.query(chain, address, mstable.stableABI, 'getPrice', [])).price) / (10 ** decimals);
  newToken.price > 1000 ? newToken.logo = exports.getTokenLogo(chain, 'mBTC') : exports.getTokenLogo(chain, 'mUSD');

  return newToken;
}