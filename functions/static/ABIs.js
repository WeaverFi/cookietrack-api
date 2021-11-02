
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
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "STAKED_TOKEN", outputs: [{ name: "", type: "address" }], type: "function" }
  ],
  incentivesABI: [
    { constant: true, inputs: [{ name: "_user", type: "address" }], name: "getUserUnclaimedRewards", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  lpABI: [
    { constant: true, inputs: [], name: "bPool", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" },
    { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
    { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" }
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
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "earned", outputs: [{ name: "", type: "uint256" }], type: "function" }
  ],
  farmABI: [
    { constant: true, inputs: [], name: "getRatio", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "token", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" }
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
    { constant: true, inputs: [], name: "joe", outputs: [{ name: "", type: "address" }], type: "function" },
    { constant: true, inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" },
    { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
    { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" }
  ]
}