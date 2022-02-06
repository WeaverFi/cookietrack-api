
// Imports:
import { minABI, bouje } from '../../ABIs';
import { initResponse, query, addToken, addLPToken } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address, Token, LPToken } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'ftm';
const project = 'bouje';
const masterChef: Address = '0x1277dd1dCbe60d597aAcA80738e1dE6cB95dCB54';
const vive: Address = '0xe509db88b3c26d45f1fff45b48e7c36a8399b45a';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getPoolBalances(wallet)));
    } catch(err: any) {
      console.error(err);
      response.status = 'error';
      response.data = [{error: 'Internal API Error'}];
    }
  }

  // Returning Response:
  return JSON.stringify(response, null, ' ');
}

/* ========================================================================================================================================================================= */

// Function to get all farm/pool balances:
const getPoolBalances = async (wallet: Address) => {
  let balances: (Token | LPToken)[] = [];
  let poolCount = parseInt(await query(chain, masterChef, bouje.masterChefABI, 'poolLength', []));
  let poolList = [...Array(poolCount).keys()];
  let promises = poolList.map(poolID => (async () => {
    let balance = parseInt((await query(chain, masterChef, bouje.masterChefABI, 'userInfo', [poolID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, masterChef, bouje.masterChefABI, 'poolInfo', [poolID])).lpToken;
      let symbol = await query(chain, token, minABI, 'symbol', []);
      if(symbol === 'spLP') {
        let newToken = await addLPToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      } else {
        let newToken = await addToken(chain, project, token, balance, wallet);
        balances.push(newToken);
      }
      let rewards = parseInt(await query(chain, masterChef, bouje.masterChefABI, 'pendingVive', [poolID, wallet]));
      if(rewards > 0) {
        let newToken = await addToken(chain, project, vive, rewards, wallet);
        balances.push(newToken);
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}