![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

![CodeQL](https://github.com/Ncookiez/cookietrack-api/actions/workflows/codeql-analysis.yml/badge.svg)
![Version](https://img.shields.io/github/package-json/v/CookieTrack-io/cookietrack-api)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

![Twitter Shield](https://img.shields.io/twitter/follow/cookietrack_io?style=social)

---

## Documentation

CookieTrack's OpenAPI documentation can be found [here](https://api.cookietrack.io/docs).

---

## Contributing

Contribution guidelines can be found [here](CONTRIBUTING.md).

---

## Local Development

Uncomment the line after 'Starting Local Server' on `functions/index.ts`.

```
cd functions
npm i
cd..
npm start
```

All scripts are already setup to build using `tsc` prior to running.

For some endpoints, an API key is required. To add your own for local development, add a `functions/static/keys.json` file with your keys.

Updating the `routes.json` file for deployment can be done through `npm run update`.

[logo]: https://github.com/Ncookiez/cookietrack-api/blob/master/favicon.svg "CookieTrack"
