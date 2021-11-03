![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

---

## Tech Stack

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

---

## Endpoints

### Wallet Balances

**/\<chain\>/wallet?address=\<wallet_address\>** - Returns a wallet's token balances.

**Chains available:**
- `ethereum`
- `bsc`
- `polygon`
- `fantom`
- `avalanche`
- `harmony`

### Project Balances

**/\<chain\>/\<project\>?address=\<wallet_address\>** - Returns a wallet's token balances in a specific project.

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

---

## Local Development:

Uncomment the line after 'Starting Local Server' on `functions/index.js`.

```
npm i
cd functions
npm i
cd..
npm start
```

[logo]: https://github.com/Ncookiez/cookietrack-api/blob/master/favicon.svg "CookieTrack"
