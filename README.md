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

### Wallet Balances

`/<chain>/wallet?address=<wallet_address>` - Returns a wallet's token balances.

**Chains available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`
- `harmony`

**Example:**
`https://api.cookietrack.io/ethereum/wallet?address=0x143642531bA06843A70FB59B4455316c21036F7d`

### Project Balances

`/<chain>/<project>?address=<wallet_address>` - Returns a wallet's token balances in a specific project.

**Ethereum Projects available:**
- `aave`

**BSC Projects available:**
- None.

**Polygon Projects available:**
- None.

**Fantom Projects available:**
- None.

**Avalanche Projects available:**
- `snowball`

**Harmony Projects available:**
- None.

**Solana Projects available:**
- None.

**Example:**
`https://api.cookietrack.io/ethereum/aave?address=0x143642531bA06843A70FB59B4455316c21036F7d`

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

[logo]: https://github.com/Ncookiez/cookietrack-api/blob/master/favicon.svg "CookieTrack"
