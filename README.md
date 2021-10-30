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

**/\<chain\>/\<project\>?address=\<wallet_address\>** - Returns a wallet's token balances.

**Projects available:**
- `snowball`

---

## Local Development:

Uncomment line 28 on `functions/index.js`.

```
npm i
cd functions
npm i
cd..
npm start
```

[logo]: https://github.com/Ncookiez/cookietrack-api/blob/master/favicon.svg "CookieTrack"
