![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

![CodeQL](https://github.com/Ncookiez/cookietrack-api/actions/workflows/codeql-analysis.yml/badge.svg)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

---

## Endpoints

A list of available endpoints can be found through `https://api.cookietrack.io/routes`.

### Wallet Balances

`/<chain>/wallet?address=<wallet_address>` - Returns a wallet's token balances.

**Chains Available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`
- `harmony`
- `solana`

**Example:**
`https://api.cookietrack.io/ethereum/wallet?address=0x143642531bA06843A70FB59B4455316c21036F7d`

### Project Balances

`/<chain>/<project>?address=<wallet_address>` - Returns a wallet's token balances in a specific project.

**Ethereum Projects Available:**
- `aave`
- `compound`
- `yearn`
- `balancer`
- `mstable`
- `pooltogether`
- `sushiswap`
- `cream`
- `curve`

**BSC Projects Available:**
- `pancakeswap`
- `autofarm`
- `belt`
- `venus`
- `beefy`
- `wault`
- `pooltogether`
- `apeswap`
- `cream`

**Polygon Projects Available:**
- `aave`
- `autofarm`
- `balancer`
- `beefy`
- `wault`
- `quickswap`
- `mstable`
- `pooltogether`
- `apeswap`
- `sushiswap`
- `cream`
- `curve`
- `iron`

**Fantom Projects Available:**
- `autofarm`
- `spookyswap`
- `beefy`
- `scream`
- `cream`
- `curve`
- `bouje`

**Avalanche Projects Available:**
- `aave`
- `snowball`
- `lydia`
- `autofarm`
- `beefy`
- `benqi`
- `traderjoe`
- `penguin`
- `cycle`
- `teddy`
- `everest`
- `yieldyak`
- `cream`
- `curve`
- `wonderland`
- `axial`
- `pangolin`
- `cookiegame`
- `avalaunch`

**Harmony Projects Available:**
- `beefy`
- `sushiswap`

**Solana Projects Available:**
- None.

**Example:**
`https://api.cookietrack.io/ethereum/aave?address=0x143642531bA06843A70FB59B4455316c21036F7d`

### Transaction History

`/<chain>/txs?address=<wallet_address>` - Returns a wallet's transaction history.

**Chains Available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`

**Example:**
`https://api.cookietrack.io/ethereum/txs?address=0x143642531bA06843A70FB59B4455316c21036F7d`

### Transaction Fees

`/<chain>/fees?address=<wallet_address>` - Returns a wallet's total transaction fees.

**Chains Available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`

**Example:**
`https://api.cookietrack.io/ethereum/fees?address=0x143642531bA06843A70FB59B4455316c21036F7d`

### Tax Reporting

`/<chain>/taxes?address=<wallet_address>` - Returns a wallet's transaction history alongside token prices for tax purposes.

**Chains Available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`

**Example:**
`https://api.cookietrack.io/ethereum/taxes?address=0x143642531bA06843A70FB59B4455316c21036F7d`

---

## Contributing

Contribution guidelines can be found [here](CONTRIBUTING.md).

---

## Local Development

Uncomment the line after 'Starting Local Server' on `functions/index.js`.

```
npm i
cd functions
npm i
cd..
npm start
```

For some endpoints, an API key is required. To add your own for local development, add a `functions/static/keys.js` file and export your key.

Updating the `routes.json` file for deployment can be done through `npm run update`.

[logo]: https://github.com/Ncookiez/cookietrack-api/blob/master/favicon.svg "CookieTrack"
