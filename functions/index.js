
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const swagger = require('swagger-ui-express');

// Fetching Firebase Logger Compatibility Patch:
require("firebase-functions/lib/logger/compat");

// Fetching Required JSON Files:
const routes = require('./static/routes.json');
const swaggerDocs = require('./static/swagger.json');

// Initializing Express Server:
const app = express();
app.use(cors());

// Initializing Text Reponses:
const repository = 'https://github.com/Ncookiez/cookietrack-api';
const rootResponse = `<title>CookieTrack API</title><p>Click <a href="${repository}">here</a> to see the API's repository, or <a href="/docs">here</a> to see its OpenAPI documentation.</p>`;
const errorResponse = `<p>Invalid route.</p>`;

// Initializing Regex Filter:
const filter = /[^a-zA-Z0-9]/;

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req, res) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.send(rootResponse);
});

// Swagger Documentation Endpoint:
app.use('/docs', swagger.serve, swagger.setup(swaggerDocs));

// Routes Endpoint:
app.get('/routes', (req, res) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.end(JSON.stringify(routes, null, ' '));
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

// Terra Endpoints:
app.get('/terra/*', async (req, res) => {
  try {
    let input = req.originalUrl.split('/')[2].split('?')[0];
    if(input.match(filter)) {
      console.error(`Invalid Query (${input})`);
      res.send(errorResponse);
    } else {
      console.info(`Loading: ${req.originalUrl}`);
      res.end(await require(`./routes/terra/${input}.js`).get(req));
    }
  } catch (err) {
    console.error(err);
    res.send(errorResponse);
  }
});

/* ========================================================================================================================================================================= */

// 404 Response:
app.all('*', async (req, res) => {
  res.send(errorResponse);
});

/* ========================================================================================================================================================================= */

// Starting Local Server:
// app.listen(3000, () => { console.info('API Up on 127.0.0.1:3000'); });

// Exporting Express App:
exports.app = functions.runWith({ memory: '1GB', timeoutSeconds: 120 }).https.onRequest(app);