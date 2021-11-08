
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
exports.traderJoe = {
  joeABI: [
    { constant: true, inputs: [], name: "joe", outputs: [{ name: "", type: "address" }], type: "function" }
  ]
}

// PancakeSwap ABIs:
exports.pancakeSwap = {
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

// AutoFarm ABIs:
exports.autofarm = {
  bscRegistryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accAUTOPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingAUTO", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  polyRegistryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accAUTOPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" }
  ],
  ftmRegistryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "<input>", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accAUTOPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" }
  ],
  avaxRegistryABI: [
    { constant: true, inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "stakedWantTokens", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "want", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accAUTOPerShare", type: "uint256" }, { name: "strat", type: "address" }], type: "function" }
  ]
}

// Belt ABIs:
exports.belt = {
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