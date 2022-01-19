![CookieTrack Logo][logo]
# CookieTrack API

The API that powers CookieTrack.

![CodeQL](https://github.com/Ncookiez/cookietrack-api/actions/workflows/codeql-analysis.yml/badge.svg)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
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
