![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

![CodeQL](https://github.com/CookieTrack-io/cookietrack-api/actions/workflows/codeql-analysis.yml/badge.svg)
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

## Rate Limits

The API endpoint at `https://api.cookietrack.io` currently has a rate limit of 200 calls every 6 hours.

This is so that everyone can enjoy the API without overloading it for others.

If you'd like to host it yourself to use without restrictions, refer to the `Self-Hosting` section below.

---

## Self-Hosting

This repository is already setup for Firebase hosting, but could easily be adapted to be deployed on AWS or any other cloud deployment service.

1. Add your own API keys in `functions/static/keys.json`. An example file is provided.

2. Install dependencies by navigating to the `functions` folder and using `npm i`.

3. Deploying to Firebase can be done through `npm run deploy`. The script is already setup to compile from Typescript, update the `routes.json` file, etc.

If you wish to test endpoints locally, you have the following options in the `index.ts` file:

- Test locally by setting `localTesting` to `true` and running `npm start`.

- Alternatively, you could test through Firebase's emulators by setting `emulatorTesting` to `true` instead and running `npm run emulator`.

- Be sure to turn off rate limiting by setting `rateLimited` to `false`!

The `cookietrack-types` npm package includes common typings for the API. Check out its repository [here](https://github.com/CookieTrack-io/cookietrack-types).

[logo]: https://github.com/CookieTrack-io/cookietrack-api/blob/master/favicon.svg "CookieTrack"
