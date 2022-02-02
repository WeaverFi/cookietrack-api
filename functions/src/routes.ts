
// Imports:
const fs = require('fs');

// Initializations:
let apiRoutes: Record<string, string[]> = {};

/* ========================================================================================================================================================================= */

// Function to update 'routes.json' file:
const update = () => {

  // Fetching Data:
  let chains: string[] = fs.readdirSync('./functions/dist/routes').filter((file: string) => file != 'template.js');
  chains.forEach(chain => {
    let endpoints = fs.readdirSync(`./functions/dist/routes/${chain}`).map((route: string) => route.slice(0, -3));
    apiRoutes[chain] = [...endpoints];
  });

  // Writing File:
  fs.writeFile('./functions/static/routes.json', JSON.stringify(apiRoutes, null, ' '), 'utf8', (err: any) => {
    if(err) {
      console.error(err);
    } else {
      console.info('Successfully updated routes file.');
    }
  });
}

/* ========================================================================================================================================================================= */

// Updating:
update();