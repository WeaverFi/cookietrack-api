
// Required Packages:
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const swagger = require('swagger-ui-express');

// Imports:
import { ChainEndpoint } from 'cookietrack-types';
import type { Request, Response, Application } from 'express';
import type { Chain } from 'cookietrack-types';

// Fetching Required JSON Files:
const routes: Record<string, string[]> = require('../static/routes.json');
const swaggerDocs: JSON = require('../static/swagger.json');

// Fetching Firebase Logger Compatibility Patch:
require("firebase-functions/lib/logger/compat");

// Initializing Express Server:
const app: Application = express();
app.use(cors());

// Initializing Firebase App:
admin.initializeApp();

// Initializing Rate Limits:
const rateLimited = true;
const maxQueries = 200;
const rateLimitTimer = 21600000;

// Initializing Text Reponses:
const repository: string = 'https://github.com/CookieTrack-io/cookietrack-api';
const discord: string = 'https://discord.com/invite/DzADcq7y75';
const rootResponse: string = `<title>CookieTrack API</title><p>Click <a href="${repository}">here</a> to see the API's repository, or <a href="/docs">here</a> to see its OpenAPI documentation.</p>`;
const errorResponse: string = `<p>Invalid route.</p>`;
const rateLimitedResponse: string = `<p>Rate limit reached. Contact us through <a href="${discord}">Discord</a> if you believe this is not working as intended.</p>`;

// Initializing Regex Query Filter:
const filter: RegExp = /[^a-zA-Z0-9]/;

/* ========================================================================================================================================================================= */

// Default Endpoint:
app.get('/', (req: Request, res: Response) => {
  res.send(rootResponse);
});

// Swagger Documentation Endpoint:
app.use('/docs', swagger.serve, swagger.setup(swaggerDocs));

// Routes Endpoint:
app.get('/routes', (req: Request, res: Response) => {
  res.end(JSON.stringify(routes, null, ' '));
});

/* ========================================================================================================================================================================= */

// Chain Endpoints:
(Object.keys(ChainEndpoint) as Chain[]).forEach(chain => {
  app.get(`/${ChainEndpoint[chain]}/*`, async (req: Request, res: Response) => {
    let rateLimitExceeded = false;
    if(rateLimited) {
      let rateLimits = admin.firestore().collection('rateLimits');
      let userID = 'u_' + (req.headers['x-forwarded-for'] as String).split(',')[0];
      let userDoc = rateLimits.doc(userID);
      let doc = await userDoc.get();
      if(doc.exists) {
        if(doc.data().lastTimestamp.toMillis() < (Date.now() - rateLimitTimer)) {
          await userDoc.update({ lastTimestamp: admin.firestore.FieldValue.serverTimestamp(), queries: 1 });
        } else if(doc.data().queries >= maxQueries) {
          rateLimitExceeded = true;
        } else {
          await userDoc.update({ queries: admin.firestore.FieldValue.increment(1) });
        }
      } else {
        await userDoc.set({ lastTimestamp: admin.firestore.FieldValue.serverTimestamp(), queries: 1 });
      }
    }
    if(!rateLimitExceeded) {
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
    } else {
      res.send(rateLimitedResponse);
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