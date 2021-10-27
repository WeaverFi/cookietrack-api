
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Required Routes:
const wallet = require('./routes/wallet.js');

// Initializing Express Server:
const app = express();
app.use(cors());

// Default Endpoint:
app.get('/', (req, res) => {
  res.send(`
    <title>CookieTrack API</title>
    <p>Click <a href="https://github.com/Ncookiez/cookietrack-api">here</a> to see the docs and endpoints available.</p>
  `);
});

// Avalanche Wallet Balance:
app.get('/avalanche/wallet', async (req, res) => {
  res.end(await wallet.get(req));
});

// Starting Local Server:
// app.listen(3000, () => { console.log('API Up on 127.0.0.1:3000'); });

// Exporting Express App:
exports.app = functions.https.onRequest(app);