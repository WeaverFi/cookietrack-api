
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const swagger = require('swagger-ui-express');

// Importing Chain List:
import { ChainEndpoint } from 'cookietrack-types';

// Importing Types:
import type { Request, Response, Application } from 'express';
import type { Chain } from 'cookietrack-types';

// Fetching Firebase Logger Compatibility Patch:
require("firebase-functions/lib/logger/compat");

// Fetching Required JSON Files:
const routes: Record<string, string[]> = require('../static/routes.json');
const swaggerDocs: JSON = require('../static/swagger.json');

// Initializing Express Server:
const app: Application = express();
app.use(cors());

// Initializing Text Reponses:
const repository: string = 'https://github.com/CookieTrack-io/cookietrack-api';
const rootResponse: string = `<title>CookieTrack API</title><p>Click <a href="${repository}">here</a> to see the API's repository, or <a href="/docs">here</a> to see its OpenAPI documentation.</p>`;
const errorResponse: string = `<p>Invalid route.</p>`;

// Initializing Regex Filter:
const filter: RegExp = /[^a-zA-Z0-9]/;

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req: Request, res: Response) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.send(rootResponse);
});

// Swagger Documentation Endpoint:
app.use('/docs', swagger.serve, swagger.setup(swaggerDocs));

// Routes Endpoint:
app.get('/routes', (req: Request, res: Response) => {
  console.info(`Loading: ${req.originalUrl}`);
  res.end(JSON.stringify(routes, null, ' '));
});


/* ========================================================================================================================================================================= */

// Chain Endpoints:
(Object.keys(ChainEndpoint) as Chain[]).forEach(chain => {
  app.get(`/${ChainEndpoint[chain]}/*`, async (req: Request, res: Response) => {
    try {
      let query = req.originalUrl.split('/');
      let chain = query[1];
      let input = query[2].split('?')[0];
      if(input.match(filter)) {
        console.error(`Invalid Query (/${chain}/${input})`);
        res.send(errorResponse);
      } else if(!routes[chain].includes(input)) {
        console.error(`Unavailable Route (/${chain}/${input})`);
        res.send(errorResponse);
      } else {
        console.info(`Loading: ${req.originalUrl}`);
        res.end(await require(`../dist/routes/${chain}/${input}.js`).get(req));
      }
    } catch(err: any) {
      console.error(err);
      res.send(errorResponse);
    }
  });
});

/* ========================================================================================================================================================================= */

// 404 Response:
app.all('*', async (req: Request, res: Response) => {
  res.send(errorResponse);
});

/* ========================================================================================================================================================================= */

// Starting Local Server:
// const port = 3000;
// app.listen(port, () => { console.info(`API Up on http://127.0.0.1:${port}`); });

// Exporting Express App:
exports.app = functions.runWith({ memory: '1GB', timeoutSeconds: 120 }).https.onRequest(app);