
// Required Packages:
const express = require('express');

// Required Routes:
const wallet = require('./routes/wallet.js');

// Initializing Express Server:
const app = express();
const port = process.env.PORT || 3000;

// Default Endpoint:
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname + '/routes/'});
});

// Avalanche Wallet Balance:
app.get('/avalanche/wallet', async (req, res) => {
  res.end(await wallet.get(req));
});

// Starting Server:
app.listen(port, () => {
  console.log(`API listening on port ${port}.`);
});