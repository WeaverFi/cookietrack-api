
// NOTE: This is not a route. Use 'npm run update-snowball' to update 'farms.json'.

// Imports:
const fs = require('fs');
const { snowball } = require('../../../static/ABIs.js');
const { query } = require('../../../static/functions.js');

// Initializations:
const chain = 'avax';
const registry = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';

/* ========================================================================================================================================================================= */

// Function to update 'farms.json' file:
const update = async () => {
  let data = {
    farms: []
  }
  try {
    let tokens = await query(chain, registry, snowball.registryABI, 'tokens', []);
    let promises = tokens.map(token => (async () => {
      let gauge = await query(chain, registry, snowball.registryABI, 'getGauge', [token]);
      if(gauge != '0x0000000000000000000000000000000000000000') {
        data.farms.push({gauge, token});
      }
    })());
    await Promise.all(promises);
  } catch {
    console.log('Error getting Snowball farm data.');
  }
  fs.writeFile('./functions/routes/partnerships/snowball/farms.json', JSON.stringify(data), 'utf8', (err) => {
    if(err) {
      console.log('Error writing to JSON file:', err);
    } else {
      console.log('Successfully updated Snowball farm data.');
    }
  });
}

/* ========================================================================================================================================================================= */

// Updating:
update();