
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Avalanche Routes:
const avax_wallet = require('./routes/avalanche/wallet.js');
const avax_snowball = require('./routes/avalanche/snowball.js');

// Partnership Routes:
const snowball_wallet = require('./routes/partnerships/snowball/wallet.js');
const snowball_strats = require('./routes/partnerships/snowball/strats.js');

// Initializing Express Server:
const app = express();
app.use(cors());

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req, res) => {
  res.send(`
    <title>CookieTrack API</title>
    <p>Click <a href="https://github.com/Ncookiez/cookietrack-api">here</a> to see the docs and endpoints available.</p>
  `);
});

/* ========================================================================================================================================================================= */

// Avalanche Wallet:
app.get('/avalanche/wallet', async (req, res) => {
  res.end(await avax_wallet.get(req));
});

/* ========================================================================================================================================================================= */

// Snowball (Avalanche):
app.get('/avalanche/snowball', async (req, res) => {
  res.end(await avax_snowball.get(req));
});

/* ========================================================================================================================================================================= */

// Snowball Partnership Endpoints:
app.get('/snowball/wallet', async (req, res) => {
  res.end(await snowball_wallet.get(req));
});
app.get('/snowball/strats', async (req, res) => {
  res.end(await snowball_strats.get(req));
});

/* ========================================================================================================================================================================= */

// Starting Local Server:
// app.listen(3000, () => { console.log('\nAPI Up on 127.0.0.1:3000'); });

// Exporting Express App:
exports.app = functions.https.onRequest(app);