
// Imports:
const fs = require('fs');

// Initializations:
let routes = {};

/* ========================================================================================================================================================================= */

// Function to update 'routes.json' file:
const update = () => {

  // Fetching Data:
  let chains = fs.readdirSync('./functions/routes').filter(i => i != 'template.js');
  chains.forEach(chain => {
    let endpoints = fs.readdirSync(`./functions/routes/${chain}`).map(e => e.slice(0, -3));
    routes[chain] = [...endpoints];
  });

  // Writing File:
  fs.writeFile('./functions/static/routes.json', JSON.stringify(routes), 'utf8', (err) => {
    if(err) {
      console.log('Error writing to JSON file:', err);
    } else {
      console.log('Successfully updated routes file.');
    }
  });
}

/* ========================================================================================================================================================================= */

// Updating:
update();