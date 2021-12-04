
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Partnership Routes:
const snowball_index = require('./routes/partnerships/snowball/index.js');
const snowball_wallet = require('./routes/partnerships/snowball/wallet.js');
const snowball_strats = require('./routes/partnerships/snowball/strats.js');
const snowball_deposits = require('./routes/partnerships/snowball/deposits.js');

// Initializing Express Server:
const app = express();
app.use(cors());

// Initializing Text Reponses:
const repository = 'https://github.com/Ncookiez/cookietrack-api';
const rootResponse = `<title>CookieTrack API</title><p>Click <a href="${repository}">here</a> to see the docs and endpoints available.</p>`;
const errorResponse = `<p>Invalid route. Click <a href="${repository}">here</a> to see the docs and endpoints available.</p>`;

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req, res) => {
  res.send(rootResponse);
});

// Ethereum Endpoints:
app.get('/ethereum/*', async (req, res) => {
  try {
    let route = require(`./routes/ethereum/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// BSC Endpoints:
app.get('/bsc/*', async (req, res) => {
  try {
    let route = require(`./routes/bsc/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// Polygon Endpoints:
app.get('/polygon/*', async (req, res) => {
  try {
    let route = require(`./routes/polygon/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// Fantom Endpoints:
app.get('/fantom/*', async (req, res) => {
  try {
    let route = require(`./routes/fantom/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// Avalanche Endpoints:
app.get('/avalanche/*', async (req, res) => {
  try {
    let route = require(`./routes/avalanche/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// Harmony Endpoints:
app.get('/harmony/*', async (req, res) => {
  try {
    let route = require(`./routes/harmony/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

// Solana Endpoints:
app.get('/solana/*', async (req, res) => {
  try {
    let route = require(`./routes/solana/${req.originalUrl.split('/')[2].split('?')[0]}.js`);
    res.end(await route.get(req));
  } catch {
    res.send(errorResponse);
  }
});

/* ========================================================================================================================================================================= */

// Snowball Partnership Endpoints (WIP):
app.get('/snowball', async (req, res) => {
  res.end(await snowball_index.get(req));
});
app.get('/snowball/wallet', async (req, res) => {
  res.end(await snowball_wallet.get(req));
});
app.get('/snowball/strats', async (req, res) => {
  res.end(await snowball_strats.get(req));
});
app.get('/snowball/deposits', async (req, res) => {
  res.end(await snowball_deposits.get(req));
});

/* ========================================================================================================================================================================= */

// Starting Local Server:
// app.listen(3000, () => { console.log('\nAPI Up on 127.0.0.1:3000'); });

// Exporting Express App:
exports.app = functions.runWith({ memory: '256MB', timeoutSeconds: 120 }).https.onRequest(app);