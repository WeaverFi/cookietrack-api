
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Fetching Firebase Logger Compatibility Patch:
require("firebase-functions/lib/logger/compat");

// Routes Endpoint:
const routes = require('./static/routes.json');

// Initializing Express Server:
const app = express();
app.use(cors());

// Initializing Text Reponses:
const repository = 'https://github.com/Ncookiez/cookietrack-api';
const rootResponse = `<title>CookieTrack API</title><p>Click <a href="${repository}">here</a> to see the docs and endpoints available.</p>`;
const errorResponse = `<p>Invalid route. Click <a href="${repository}">here</a> to see the docs and endpoints available.</p>`;

// Initializing Regex Filter:
const filter = /[^a-zA-Z0-9]/;

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req, res) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.send(rootResponse);
});

// Routes Endpoint:
app.get('/routes', (req, res) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.end(JSON.stringify(routes));
});


/* ========================================================================================================================================================================= */

// Ethereum Endpoints:
app.get('/ethereum/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/ethereum/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// BSC Endpoints:
app.get('/bsc/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/bsc/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// Polygon Endpoints:
app.get('/polygon/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/polygon/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// Fantom Endpoints:
app.get('/fantom/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/fantom/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// Avalanche Endpoints:
app.get('/avalanche/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/avalanche/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// Harmony Endpoints:
app.get('/harmony/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/harmony/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

// Solana Endpoints:
app.get('/solana/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/solana/${input}.js`).get(req));
    }
  } catch(err) {
    console.error(err);
    res.send(errorResponse);
  }
});

/* ========================================================================================================================================================================= */

// Starting Local Server:
// app.listen(3000, () => { console.info('API Up on 127.0.0.1:3000'); });

// Exporting Express App:
exports.app = functions.runWith({ memory: '512MB', timeoutSeconds: 120 }).https.onRequest(app);