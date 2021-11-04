
// NOTE: This is not a route. Use 'npm run update-snowball' to update 'farms.json'.

// Required Packages:
const { ethers } = require('ethers');
const fs = require('fs');

// Required Variables:
const { rpc_avax } = require('../../../static/RPCs.js');
const { snowball } = require('../../../static/ABIs.js');

// Initializations:
const registry = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';

/* ========================================================================================================================================================================= */

// Function to update 'farms.json' file:
const update = async () => {
  let data = {
    farms: []
  }
  try {
    let avax = new ethers.providers.JsonRpcProvider(rpc_avax);
    let registryContract = new ethers.Contract(registry, snowball.registryABI, avax);
    let tokens = await registryContract.tokens();
    let promises = tokens.map(token => (async () => {
      let gauge = await registryContract.getGauge(token);
      if(gauge != '0x0000000000000000000000000000000000000000') {
        data.farms.push({gauge, token});
      }
    })());
    await Promise.all(promises);
  } catch {
    console.log('Error getting farm data.');
  }
  fs.writeFile('./functions/routes/partnerships/snowball/farms.json', JSON.stringify(data), 'utf8', (err) => {
    if(err) {
      console.log('Error writing to JSON file:', err);
    } else {
      console.log('Successfully updated farm data.');
    }
  });
}

/* ========================================================================================================================================================================= */

// Updating:
update();