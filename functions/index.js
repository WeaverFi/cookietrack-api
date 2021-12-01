
// Required Packages:
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Ethereum Routes:
const eth_wallet = require('./routes/ethereum/wallet.js');
const eth_txs = require('./routes/ethereum/txs.js');
const eth_fees = require('./routes/ethereum/fees.js');
const eth_aave = require('./routes/ethereum/aave.js');
const eth_compound = require('./routes/ethereum/compound.js');
const eth_yearn = require('./routes/ethereum/yearn.js');
const eth_balancer = require('./routes/ethereum/balancer.js');
const eth_mstable = require('./routes/ethereum/mstable.js');
const eth_pooltogether = require('./routes/ethereum/pooltogether.js');
const eth_sushiswap = require('./routes/ethereum/sushiswap.js');
const eth_cream = require('./routes/ethereum/cream.js');
const eth_curve = require('./routes/ethereum/curve.js');

// BSC Routes:
const bsc_wallet = require('./routes/bsc/wallet.js');
const bsc_txs = require('./routes/bsc/txs.js');
const bsc_fees = require('./routes/bsc/fees.js');
const bsc_pancakeswap = require('./routes/bsc/pancakeswap.js');
const bsc_autofarm = require('./routes/bsc/autofarm.js');
const bsc_belt = require('./routes/bsc/belt.js');
const bsc_venus = require('./routes/bsc/venus.js');
const bsc_beefy = require('./routes/bsc/beefy.js');
const bsc_wault = require('./routes/bsc/wault.js');
const bsc_pooltogether = require('./routes/bsc/pooltogether.js');
const bsc_apeswap = require('./routes/bsc/apeswap.js');
const bsc_cream = require('./routes/bsc/cream.js');

// Polygon Routes:
const poly_wallet = require('./routes/polygon/wallet.js');
const poly_txs = require('./routes/polygon/txs.js');
const poly_fees = require('./routes/polygon/fees.js');
const poly_aave = require('./routes/polygon/aave.js');
const poly_autofarm = require('./routes/polygon/autofarm.js');
const poly_balancer = require('./routes/polygon/balancer.js');
const poly_beefy = require('./routes/polygon/beefy.js');
const poly_wault = require('./routes/polygon/wault.js');
const poly_quickswap = require('./routes/polygon/quickswap.js');
const poly_mstable = require('./routes/polygon/mstable.js');
const poly_pooltogether = require('./routes/polygon/pooltogether.js');
const poly_apeswap = require('./routes/polygon/apeswap.js');
const poly_sushiswap = require('./routes/polygon/sushiswap.js');
const poly_cream = require('./routes/polygon/cream.js');
const poly_curve = require('./routes/polygon/curve.js');
const poly_iron = require('./routes/polygon/iron.js');

// Fantom Routes:
const ftm_wallet = require('./routes/fantom/wallet.js');
const ftm_txs = require('./routes/fantom/txs.js');
const ftm_fees = require('./routes/fantom/fees.js');
const ftm_autofarm = require('./routes/fantom/autofarm.js');
const ftm_spookyswap = require('./routes/fantom/spookyswap.js');
const ftm_beefy = require('./routes/fantom/beefy.js');
const ftm_scream = require('./routes/fantom/scream.js');
const ftm_cream = require('./routes/fantom/cream.js');
const ftm_curve = require('./routes/fantom/curve.js');
const ftm_bouje = require('./routes/fantom/bouje.js');

// Avalanche Routes:
const avax_wallet = require('./routes/avalanche/wallet.js');
const avax_txs = require('./routes/avalanche/txs.js');
const avax_fees = require('./routes/avalanche/fees.js');
const avax_aave = require('./routes/avalanche/aave.js');
const avax_snowball = require('./routes/avalanche/snowball.js');
const avax_lydia = require('./routes/avalanche/lydia.js');
const avax_autofarm = require('./routes/avalanche/autofarm.js');
const avax_beefy = require('./routes/avalanche/beefy.js');
const avax_benqi = require('./routes/avalanche/benqi.js');
const avax_traderjoe = require('./routes/avalanche/traderjoe.js');
const avax_penguin = require('./routes/avalanche/penguin.js');
const avax_cycle = require('./routes/avalanche/cycle.js');
const avax_teddy = require('./routes/avalanche/teddy.js');
const avax_everest = require('./routes/avalanche/everest.js');
const avax_yieldyak = require('./routes/avalanche/yieldyak.js');
const avax_cream = require('./routes/avalanche/cream.js');
const avax_curve = require('./routes/avalanche/curve.js');
const avax_wonderland = require('./routes/avalanche/wonderland.js');
const avax_axial = require('./routes/avalanche/axial.js');
const avax_pangolin = require('./routes/avalanche/pangolin.js');

// Harmony Routes:
const one_wallet = require('./routes/harmony/wallet.js');
const one_beefy = require('./routes/harmony/beefy.js');
const one_sushiswap = require('./routes/harmony/sushiswap.js');

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

// Solana Wallet:
// <TODO>

/* ========================================================================================================================================================================= */

// Ethereum TX History:
app.get('/ethereum/txs', async (req, res) => {
  res.end(await eth_txs.get(req));
});

// BSC TX History:
app.get('/bsc/txs', async (req, res) => {
  res.end(await bsc_txs.get(req));
});

// Polygon TX History:
app.get('/polygon/txs', async (req, res) => {
  res.end(await poly_txs.get(req));
});

// Fantom TX History:
app.get('/fantom/txs', async (req, res) => {
  res.end(await ftm_txs.get(req));
});

// Avalanche TX History:
app.get('/avalanche/txs', async (req, res) => {
  res.end(await avax_txs.get(req));
});

// Harmony TX History:
// <TODO>

// Solana TX History:
// <TODO>

/* ========================================================================================================================================================================= */

// Ethereum Fees:
app.get('/ethereum/fees', async (req, res) => {
  res.end(await eth_fees.get(req));
});

// BSC Fees:
app.get('/bsc/fees', async (req, res) => {
  res.end(await bsc_fees.get(req));
});

// Polygon Fees:
app.get('/polygon/fees', async (req, res) => {
  res.end(await poly_fees.get(req));
});

// Fantom Fees:
app.get('/fantom/fees', async (req, res) => {
  res.end(await ftm_fees.get(req));
});

// Avalanche Fees:
app.get('/avalanche/fees', async (req, res) => {
  res.end(await avax_fees.get(req));
});

// Harmony Fees:
// <TODO>

// Solana Fees:
// <TODO>

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
app.get('/ethereum/balancer', async (req, res) => {
  res.end(await eth_balancer.get(req));
});

// Balancer (Polygon):
app.get('/polygon/balancer', async (req, res) => {
  res.end(await poly_balancer.get(req));
});

// Belt (BSC):
app.get('/bsc/belt', async (req, res) => {
  res.end(await bsc_belt.get(req));
});

// Venus (BSC):
app.get('/bsc/venus', async (req, res) => {
  res.end(await bsc_venus.get(req));
});

// Beefy (BSC):
app.get('/bsc/beefy', async (req, res) => {
  res.end(await bsc_beefy.get(req));
});

// Beefy (Polygon):
app.get('/polygon/beefy', async (req, res) => {
  res.end(await poly_beefy.get(req));
});

// Beefy (Fantom):
app.get('/fantom/beefy', async (req, res) => {
  res.end(await ftm_beefy.get(req));
});

// Beefy (Avalanche):
app.get('/avalanche/beefy', async (req, res) => {
  res.end(await avax_beefy.get(req));
});

// Beefy (Harmony):
app.get('/harmony/beefy', async (req, res) => {
  res.end(await one_beefy.get(req));
});

// Wault (BSC):
app.get('/bsc/wault', async (req, res) => {
  res.end(await bsc_wault.get(req));
});

// Wault (Polygon):
app.get('/polygon/wault', async (req, res) => {
  res.end(await poly_wault.get(req));
});

// QuickSwap (Polygon):
app.get('/polygon/quickswap', async (req, res) => {
  res.end(await poly_quickswap.get(req));
});

// SpookySwap (Fantom):
app.get('/fantom/spookyswap', async (req, res) => {
  res.end(await ftm_spookyswap.get(req));
});

// BenQi (Avalanche):
app.get('/avalanche/benqi', async (req, res) => {
  res.end(await avax_benqi.get(req));
});

// YieldYak (Avalanche):
app.get('/avalanche/yieldyak', async (req, res) => {
  res.end(await avax_yieldyak.get(req));
});

// Trader Joe (Avalanche):
app.get('/avalanche/traderjoe', async (req, res) => {
  res.end(await avax_traderjoe.get(req));
});

// mStable (Ethereum):
app.get('/ethereum/mstable', async (req, res) => {
  res.end(await eth_mstable.get(req));
});

// mStable (Polygon):
app.get('/polygon/mstable', async (req, res) => {
  res.end(await poly_mstable.get(req));
});

// Penguin (Avalanche):
app.get('/avalanche/penguin', async (req, res) => {
  res.end(await avax_penguin.get(req));
});

// Scream (Fantom):
app.get('/fantom/scream', async (req, res) => {
  res.end(await ftm_scream.get(req));
});

// Snowball (Avalanche):
app.get('/avalanche/snowball', async (req, res) => {
  res.end(await avax_snowball.get(req));
});

// Cycle (Avalanche):
app.get('/avalanche/cycle', async (req, res) => {
  res.end(await avax_cycle.get(req));
});

// PoolTogether (Ethereum):
app.get('/ethereum/pooltogether', async (req, res) => {
  res.end(await eth_pooltogether.get(req));
});

// PoolTogether (BSC):
app.get('/bsc/pooltogether', async (req, res) => {
  res.end(await bsc_pooltogether.get(req));
});

// PoolTogether (Polygon):
app.get('/polygon/pooltogether', async (req, res) => {
  res.end(await poly_pooltogether.get(req));
});

// Lydia (Avalanche):
app.get('/avalanche/lydia', async (req, res) => {
  res.end(await avax_lydia.get(req));
});

// Teddy (Avalanche):
app.get('/avalanche/teddy', async (req, res) => {
  res.end(await avax_teddy.get(req));
});

// Everest (Avalanche):
app.get('/avalanche/everest', async (req, res) => {
  res.end(await avax_everest.get(req));
});

// ApeSwap (BSC):
app.get('/bsc/apeswap', async (req, res) => {
  res.end(await bsc_apeswap.get(req));
});

// ApeSwap (Polygon):
app.get('/polygon/apeswap', async (req, res) => {
  res.end(await poly_apeswap.get(req));
});

// SushiSwap (Ethereum):
app.get('/ethereum/sushiswap', async (req, res) => {
  res.end(await eth_sushiswap.get(req));
});

// SushiSwap (Polygon):
app.get('/polygon/sushiswap', async (req, res) => {
  res.end(await poly_sushiswap.get(req));
});

// SushiSwap (Harmony):
app.get('/harmony/sushiswap', async (req, res) => {
  res.end(await one_sushiswap.get(req));
});

// Cream (Ethereum):
app.get('/ethereum/cream', async (req, res) => {
  res.end(await eth_cream.get(req));
});

// Cream (BSC):
app.get('/bsc/cream', async (req, res) => {
  res.end(await bsc_cream.get(req));
});

// Cream (Polygon):
app.get('/polygon/cream', async (req, res) => {
  res.end(await poly_cream.get(req));
});

// Cream (Fantom):
app.get('/fantom/cream', async (req, res) => {
  res.end(await ftm_cream.get(req));
});

// Cream (Avalanche):
app.get('/avalanche/cream', async (req, res) => {
  res.end(await avax_cream.get(req));
});

// Curve (Ethereum):
app.get('/ethereum/curve', async (req, res) => {
  res.end(await eth_curve.get(req));
});

// Curve (Polygon):
app.get('/polygon/curve', async (req, res) => {
  res.end(await poly_curve.get(req));
});

// Curve (Fantom):
app.get('/fantom/curve', async (req, res) => {
  res.end(await ftm_curve.get(req));
});

// Curve (Avalanche):
app.get('/avalanche/curve', async (req, res) => {
  res.end(await avax_curve.get(req));
});

// Iron (Polygon):
app.get('/polygon/iron', async (req, res) => {
  res.end(await poly_iron.get(req));
});

// Wonderland (Avalanche):
app.get('/avalanche/wonderland', async (req, res) => {
  res.end(await avax_wonderland.get(req));
});

// Bouje (Fantom):
app.get('/fantom/bouje', async (req, res) => {
  res.end(await ftm_bouje.get(req));
});

// Axial (Avalanche):
app.get('/avalanche/axial', async (req, res) => {
  res.end(await avax_axial.get(req));
});

// Pangolin (Avalanche):
app.get('/avalanche/pangolin', async (req, res) => {
  res.end(await avax_pangolin.get(req));
});

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