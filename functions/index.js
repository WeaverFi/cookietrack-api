
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Ethereum Routes:
const eth_wallet = require('./routes/ethereum/wallet.js');
const eth_aave = require('./routes/ethereum/aave.js');
const eth_compound = require('./routes/ethereum/compound.js');
const eth_yearn = require('./routes/ethereum/yearn.js');

// BSC Routes:
const bsc_wallet = require('./routes/bsc/wallet.js');
const bsc_pancakeswap = require('./routes/bsc/pancakeswap.js');
const bsc_autofarm = require('./routes/bsc/autofarm.js');

// Polygon Routes:
const poly_wallet = require('./routes/polygon/wallet.js');
const poly_aave = require('./routes/polygon/aave.js');
const poly_autofarm = require('./routes/polygon/autofarm.js');

// Fantom Routes:
const ftm_wallet = require('./routes/fantom/wallet.js');
const ftm_autofarm = require('./routes/fantom/autofarm.js');

// Avalanche Routes:
const avax_wallet = require('./routes/avalanche/wallet.js');
const avax_aave = require('./routes/avalanche/aave.js');
const avax_snowball = require('./routes/avalanche/snowball.js');
const avax_autofarm = require('./routes/avalanche/autofarm.js');

// Harmony Routes:
const one_wallet = require('./routes/harmony/wallet.js');

// Partnership Routes:
const snowball_index = require('./routes/partnerships/snowball/index.js');
const snowball_wallet = require('./routes/partnerships/snowball/wallet.js');
const snowball_strats = require('./routes/partnerships/snowball/strats.js');
const snowball_deposits = require('./routes/partnerships/snowball/deposits.js');

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

// Ethereum Wallet:
app.get('/ethereum/wallet', async (req, res) => {
  res.end(await eth_wallet.get(req));
});

// BSC Wallet:
app.get('/bsc/wallet', async (req, res) => {
  res.end(await bsc_wallet.get(req));
});

// Polygon Wallet:
app.get('/polygon/wallet', async (req, res) => {
  res.end(await poly_wallet.get(req));
});

// Fantom Wallet:
app.get('/fantom/wallet', async (req, res) => {
  res.end(await ftm_wallet.get(req));
});

// Avalanche Wallet:
app.get('/avalanche/wallet', async (req, res) => {
  res.end(await avax_wallet.get(req));
});

// Harmony Wallet:
app.get('/harmony/wallet', async (req, res) => {
  res.end(await one_wallet.get(req));
});

/* ========================================================================================================================================================================= */

// Aave (Ethereum):
app.get('/ethereum/aave', async (req, res) => {
  res.end(await eth_aave.get(req));
});

// Aave (Polygon):
app.get('/polygon/aave', async (req, res) => {
  res.end(await poly_aave.get(req));
});

// Aave (Avalanche):
app.get('/avalanche/aave', async (req, res) => {
  res.end(await avax_aave.get(req));
});

// PancakeSwap (BSC):
app.get('/bsc/pancakeswap', async (req, res) => {
  res.end(await bsc_pancakeswap.get(req));
});

// AutoFarm (BSC):
app.get('/bsc/autofarm', async (req, res) => {
  res.end(await bsc_autofarm.get(req));
});

// AutoFarm (Polygon):
app.get('/polygon/autofarm', async (req, res) => {
  res.end(await poly_autofarm.get(req));
});

// AutoFarm (Fantom):
app.get('/fantom/autofarm', async (req, res) => {
  res.end(await ftm_autofarm.get(req));
});

// AutoFarm (Avalanche):
app.get('/avalanche/autofarm', async (req, res) => {
  res.end(await avax_autofarm.get(req));
});

// Compound (Ethereum):
app.get('/ethereum/compound', async (req, res) => {
  res.end(await eth_compound.get(req));
});

// Yearn (Ethereum):
app.get('/ethereum/yearn', async (req, res) => {
  res.end(await eth_yearn.get(req));
});

// Balancer (Ethereum):
// Balancer (Polygon):

// Belt (BSC):

// Venus (BSC):

// Beefy (BSC):
// Beefy (Polygon):
// Beefy (Fantom):
// Beefy (Avalanche):
// Beefy (Harmony):

// Wault (BSC):
// Wault (Polygon):

// QuickSwap (Polygon):

// SpookySwap (Fantom):

// BenQi (Avalanche):

// Pangolin (Avalanche):

// HoneyFarm (BSC):

// YieldYak (Avalanche):

// Trader Joe (Avalanche):

// mStable (Ethereum):
// mStable (Polygon):

// Penguin (Avalanche):

// Scream (Fantom):

// Snowball (Avalanche):
app.get('/avalanche/snowball', async (req, res) => {
  res.end(await avax_snowball.get(req));
});

// Cycle (Avalanche):

// PoolTogether (Ethereum):
// PoolTogether (BSC):
// PoolTogether (Polygon):

// Lydia (Avalanche):

// Teddy (Avalanche):

// Everest (Avalanche):

// ApeSwap (BSC):
// ApeSwap (Polygon):

// SushiSwap (Ethereum):
// SushiSwap (BSC):
// SushiSwap (Polygon):
// SushiSwap (Fantom):
// SushiSwap (Avalanche):
// SushiSwap (Harmony):

// Cream (Ethereum):
// Cream (BSC):
// Cream (Polygon):
// Cream (Fantom):
// Cream (Avalanche):

// Curve (Ethereum):
// Curve (Polygon):
// Curve (Fantom):
// Curve (Avalanche):

// Iron (Polygon):

// Wonderland (Avalanche):

// Bouje (Fantom):

// Axial (Avalanche):

/* ========================================================================================================================================================================= */

// Snowball Partnership Endpoints:
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