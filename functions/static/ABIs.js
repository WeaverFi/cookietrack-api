
// General-Purpose Minimal ABI:
exports.minABI = [
  { constant: true, inputs: [{ name: "", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" },
  { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];

// General-Purpose LP Token ABI:
exports.lpABI = [
  { constant: true, inputs: [], name: "token0", outputs: [{ name: "", type: "address" }], type: "function" },
  { constant: true, inputs: [], name: "token1", outputs: [{ name: "", type: "address" }], type: "function" },
  { constant: true, inputs: [], name: "getReserves", outputs: [{ name: "", type: "uint112" }, { name: "", type: "uint112" }, { name: "", type: "uint32" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
];

/* ========================================================================================================================================================================= */

// Aave ABIs:
exports.aave = {
  stakingABI: [
    { constant: true, inputs: [], name: "STAKED_TOKEN", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  incentivesABI: [
    { constant: true, inputs: [{ name: "_user", type: "address" }], name: "getUserUnclaimedRewards", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  lpABI: [
    { constant: true, inputs: [], name: "bPool", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  registryABI: [
    { constant: true, inputs: [{ name: "asset", type: "address" }], name: "getReserveTokensAddresses", outputs: [{ name: "aTokenAddress", type: "address" }, { name: "stableDebtTokenAddress", type: "address" }, { name: "variableDebtTokenAddress", type: "address" }], type: "function" }
  ]
}

// Balancer ABIs:
exports.balancer = {
  tokenABI: [
    { constant: true, inputs: [], name: "getCurrentTokens", outputs: [{ name: "", type: "address[]" }], type: "function" },
    { constant: true, inputs: [{ name: "token", type: "address" }], name: "getBalance", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  vaultABI: [
    { constant: true, inputs: [{ name: "poolId", type: "bytes32" }], name: "getPool", outputs: [{ name: "", type: "address" }, { name: "", type: "uint8" }], type: "function" },
    { constant: true, inputs: [{ name: "poolId", type: "bytes32" }], name: "getPoolTokens", outputs: [{ name: "tokens", type: "address[]" }, { name: "balances", type: "uint256[]" }], type: "function" }
  ]
}

// Snowball ABIs:
exports.snowball = {
  registryABI: [
    { constant: true, inputs: [], name: "tokens", outputs: [{ name: "", type: "address[]" }], type: "function" },
    { constant: true, inputs: [{ name: "_token", type: "address" }], name: "getGauge", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  gaugeABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  farmABI: [
    { constant: true, inputs: [], name: "getRatio", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "arg0", type: "address" }], name: "locked", outputs: [{ name: "amount", type: "uint128" }, { name: "end", type: "uint256" }], type: "function" }
  ],
  s4dABI: [
    { constant: true, inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  s4dControllerABI: [
    { constant: true, inputs: [], name: "getVirtualPrice", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Trader Joe ABIs:
exports.traderjoe = {
  joeABI: [
    { constant: true, inputs: [], name: "joe", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  masterChefABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTimestamp", type: "uint256" }, { name: "accJoePerShare", type: "uint256" }, { name: "rewarder", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingTokens", outputs: [{ name: "pendingJoe", type: "uint256" }, { name: "bonusTokenAddress", type: "address" }, { name: "bonusTokenSymbol", type: "string" }, { name: "pendingBonusToken", type: "uint256" }], type: "function" }
  ],
  bankControllerABI: [
    { constant: true, inputs: [], name: "getAllMarkets", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  marketABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountSnapshot", outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// PancakeSwap ABIs:
exports.pancakeswap = {
  registryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accCakePerShare", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingCake", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  autoCakePoolABI: [
    { constant: true, inputs: [{ name: "", type: "address" }], name: "userInfo", outputs: [{ name: "shares", type: "uint256" }, { name: "lastDepositedTime", type: "uint256" }, { name: "cakeAtLastUserAction", type: "uint256" }, { name: "lastUserActionTime", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "getPricePerFullShare", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Lydia ABIs:
exports.lydia = {
  registryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTimestamp", type: "uint256" }, { name: "accLydPerShare", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingLyd", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  lydFarmABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "sharesOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "getPricePerFullShare", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  maximusFarmABI: [
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// AutoFarm ABIs:
exports.autofarm = {
  registryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accAUTOPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" }
  ],
  pendingRewardsABI: [
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingAUTO", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Belt ABIs:
exports.belt = {
  masterBeltABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accBELTPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingBELT", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  tokenABI: [
    { constant: true, inputs: [], name: "getPricePerFullShare", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// Alpaca ABIs:
exports.alpaca = {
  tokenABI: [
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "totalToken", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Curve ABIs:
exports.curve = {
  registryABI: [
    { constant: true, inputs: [{ name: "arg0", type: "address" }], name: "get_pool_from_lp_token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pool", type: "address" }], name: "get_underlying_coins", outputs: [{ name: "", type: "address[8]" }], type: "function" },
    { constant: true, inputs: [{ name: "_pool", type: "address" }], name: "get_balances", outputs: [{ name: "", type: "uint256[8]" }], type: "function" },
    { constant: true, inputs: [{ name: "_token", type: "address" }], name: "get_virtual_price_from_lp_token", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  polyTokenABI: [
    { constant: true, inputs: [], name: "minter", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  ftmTokenABI: [
    { constant: true, inputs: [], name: "get_virtual_price", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "balances", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "coins", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "minter", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  avaxTokenABI: [
    { constant: true, inputs: [], name: "minter", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  minterABI: [
    { constant: true, inputs: [{ name: "i", type: "uint256" }], name: "balances", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "get_virtual_price", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "coins", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "underlying_coins", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  intermediaryABI: [
    { constant: true, inputs: [], name: "UNDERLYING_ASSET_ADDRESS", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// BZX ABIs:
exports.bzx = {
  tokenABI: [
    { constant: true, inputs: [], name: "loanTokenAddress", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "tokenPrice", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Compound ABIs:
exports.compound = {
  controllerABI: [
    { constant: true, inputs: [], name: "getAllMarkets", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  marketABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountSnapshot", outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// Yearn ABIs:
exports.yearn = {
  deployerABI: [
    { constant: true, inputs: [], name: "numTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "uint256" }], name: "tokens", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "address" }], name: "numVaults", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "arg0", type: "address" }, { name: "arg1", type: "uint256" }], name: "vaults", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  vaultABI: [
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "pricePerShare", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  tokenABI: [
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "getPricePerFullShare", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Venus ABIs:
exports.venus = {
  controllerABI: [
    { constant: true, inputs: [], name: "getAllMarkets", outputs: [{ name: "", type: "address[]" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "venusAccrued", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  marketABI: [
    { constant: true, inputs: [], name: "exchangeRateStored", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "borrowBalanceStored", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  vaultABI: [
    { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_user", type: "address" }], name: "pendingXVS", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Iron ABIs:
exports.iron = {
  tokenABI: [
    { constant: true, inputs: [], name: "swap", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  swapABI: [
    { constant: true, inputs: [], name: "getVirtualPrice", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// SpookySwap ABIs:
exports.spookyswap = {
  masterChefABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }, { name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTime", type: "uint256" }, { name: "accBOOPerShare", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingBOO", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  xbooABI: [
    { constant: true, inputs: [{ name: "_account", type: "address" }], name: "BOOBalance", outputs: [{ name: "booAmount_", type: "uint256" }], type: "function" }
  ]
}

// Beefy ABIs:
exports.beefy = {
  vaultABI: [
		{ constant: true, inputs: [], name: "getPricePerFullShare", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Wault ABIs:
exports.wault = {
  masterABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
		{ constant: true, inputs: [{ name: "<input>", type: "uint256" }, { name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }, { name: "pendingRewards", type: "uint256" }], type: "function" },
		{ constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accWexPerShare", type: "uint256" }], type: "function" }
  ]
}

// Quickswap ABIs:
exports.quickswap = {
  registryABI: [
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "stakingTokens", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "stakingRewardsInfoByStakingToken", outputs: [{ name: "stakingRewards", type: "address" }, { name: "rewardAmount", type: "uint256" }, { name: "duration", type: "uint256" }], type: "function" }
  ],
  dualRegistryABI: [
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "stakingTokens", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "stakingRewardsInfoByStakingToken", outputs: [{ name: "stakingRewards", type: "address" }, { name: "rewardsTokenA", type: "address" }, { name: "rewardsTokenB", type: "address" }, { name: "rewardAmountA", type: "uint256" }, { name: "rewardAmountB", type: "uint256" }, { name: "duration", type: "uint256" }], type: "function" }
  ],
  farmABI: [
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  dualFarmABI: [
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earnedA", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earnedB", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "_dQuickAmount", type: "uint256" }], name: "dQUICKForQUICK", outputs: [{ name: "quickAmount_", type: "uint256" }], type: "function" }
  ]
}

// BenQi ABIs:
exports.benqi = {
  controllerABI: [
    { constant: true, inputs: [], name: "getAllMarkets", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  marketABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountSnapshot", outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// Axial ABIs:
exports.axial = {
  tokenABI: [
    { constant: true, inputs: [], name: "owner", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  swapABI: [
    { constant: true, inputs: [], name: "getVirtualPrice", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// mStable ABIs:
exports.mstable = {
  assetABI: [
    { constant: true, inputs: [], name: "exchangeRate", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  vaultABI: [
    { constant: true, inputs: [{ name: "_account", type: "address" }], name: "rawBalanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "_account", type: "address" }], name: "rawBalanceOf", outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "STAKED_TOKEN", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  mbptABI: [
    { constant: true, inputs: [], name: "getPoolId", outputs: [{ name: "", type: "bytes32" }], type: "function" }
  ],
  stableABI: [
    { constant: true, inputs: [], name: "getPrice", outputs: [{ name: "price", type: "uint256" }, { name: "k", type: "uint256" }], type: "function" }
  ]
}

// Penguin ABIs:
exports.penguin = {
  masterABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "poolToken", type: "address" }, { name: "rewarder", type: "address" }, { name: "strategy", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTime", type: "uint256" }, { name: "accPEFIPerShare", type: "uint256" }, { name: "withdrawFeeBP", type: "uint16" }, { name: "totalShares", type: "uint256" }, { name: "lpPerShare", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "pid", type: "uint256" }, { name: "user", type: "address" }], name: "pendingTokens", outputs: [{ name: "", type: "address[]" }, { name: "", type: "uint256[]" }], type: "function" },
    { constant: true, inputs: [{ name: "pid", type: "uint256" }, { name: "penguin", type: "address" }], name: "totalPendingPEFI", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  nestABI: [
    { constant: true, inputs: [], name: "currentExchangeRate", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Scream ABIs:
exports.scream = {
  controllerABI: [
    { constant: true, inputs: [], name: "getAllMarkets", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  marketABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountSnapshot", outputs: [{ name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }, { name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "underlying", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [], name: "getShareValue", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Cycle ABIs:
exports.cycle = {
  distributorABI: [
    { constant: true, inputs: [], name: "getVaultRewardsCount", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "rewards", outputs: [{ name: "StakingRewards", type: "address" }, { name: "weight", type: "uint256" }], type: "function" }
  ],
  vaultABI: [
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  intermediaryABI: [
    { constant: true, inputs: [], name: "LPtoken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountLP", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "shares", type: "uint256" }], name: "getLPamountForShares", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "getAccountCYCLE", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// PoolTogether ABIs:
exports.pooltogether = {
  registryABI: [
    { constant: true, inputs: [], name: "getAddresses", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  strategyABI: [
    { constant: true, inputs: [], name: "tokenListener", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  listenerABI: [
    { constant: true, inputs: [], name: "getAddresses", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  poolABI: [
    { constant: true, inputs: [], name: "prizeStrategy", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "tokens", outputs: [{ name: "", type: "address[]" }], type: "function" }
  ],
  podABI: [
    { constant: true, inputs: [{ name: "user", type: "address" }], name: "balanceOfUnderlying", outputs: [{ name: "amount", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  faucetABI: [
    { constant: true, inputs: [], name: "asset", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "address" }], name: "userStates", outputs: [{ name: "lastExchangeRateMantissa", type: "uint128" }, { name: "balance", type: "uint128" }], type: "function" }
  ]
}

// Teddy ABIs:
exports.teddy = {
  troveABI: [
    { constant: true, inputs: [{ name: "", type: "address" }], name: "Troves", outputs: [{ name: "debt", type: "uint256" }, { name: "coll", type: "uint256" }, { name: "stake", type: "uint256" }, { name: "status", type: "uint8" }, { name: "arrayIndex", type: "uint128" }], type: "function" }
  ],
  stabilityPoolABI: [
    { constant: true, inputs: [{ name: "", type: "address" }], name: "deposits", outputs: [{ name: "initialValue", type: "uint256" }, { name: "frontEndTag", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_depositor", type: "address" }], name: "getDepositorETHGain", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_depositor", type: "address" }], name: "getDepositorLQTYGain", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "", type: "address" }], name: "stakes", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_user", type: "address" }], name: "getPendingETHGain", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_user", type: "address" }], name: "getPendingLUSDGain", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// Everest ABIs:
exports.everest = {
  farmABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "stakingToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "currentExchangeRate", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// ApeSwap ABIs:
exports.apeswap = {
  masterApeABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }, { name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accCakePerShare", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingCake", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  polyMasterApeABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }, { name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "lpToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingBanana", outputs: [{ name: "pending", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "rewarder", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  rewarderABI: [
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingToken", outputs: [{ name: "pending", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "rewardToken", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  vaultMasterABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "strat", type: "address" }], type: "function" }
  ]
}

// SushiSwap ABIs:
exports.sushiswap = {
  masterChefABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }, { name: "<input>", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "lpToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingSushi", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}

// YieldYak ABIs:
exports.yieldyak = {
  farmABI: [
    { constant: true, inputs: [], name: "depositToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "totalDeposits", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "name", outputs: [{ name: "", type: "string" }], type: "function" }
  ],
  stakingABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardTokenDebt", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "token", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardTimestamp", type: "uint256" }, { name: "accRewardsPerShare", type: "uint256" }, { name: "vpForDeposit", type: "bool" }], type: "function" },
    { constant: true, inputs: [{ name: "pid", type: "uint256" }, { name: "account", type: "address" }], name: "pendingRewards", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  intermediaryABI: [
    { constant: true, inputs: [], name: "depositToken", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "amount", type: "uint256" }], name: "getDepositTokensForShares", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ]
}