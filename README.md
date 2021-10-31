![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

---

## Endpoints

### Wallet Balances

**/\<chain\>/wallet?address=\<wallet_address\>** - Returns a wallet's token balances.

**Chains available:**
- `avalanche`

### Project Balances

**/\<chain\>/\<project\>?address=\<wallet_address\>** - Returns a wallet's token balances in a specific project.

**Ethereum Projects available:**
- None.

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
