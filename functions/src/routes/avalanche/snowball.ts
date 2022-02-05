
// Imports:
import { minABI, snowball } from '../../ABIs';
import { initResponse, query, addToken, addLPToken, addS4DToken, addTraderJoeToken, addAxialToken } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address, Token, LPToken } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'avax';
const project = 'snowball';
const registry: Address = '0x215D5eDEb6A6a3f84AE9d72962FEaCCdF815BF27';
const snob: Address = '0xC38f41A296A4493Ff429F1238e030924A1542e50';
const xsnob: Address = '0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req: Request): Promise<string> => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getStakedSNOB(wallet)));
      response.data.push(...(await getFarmBalances(wallet)));
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

// Function to get staked SNOB balance:
const getStakedSNOB = async (wallet: Address): Promise<Token[]> => {
  let locked = await query(chain, xsnob, snowball.stakingABI, 'locked', [wallet]);
  let balance = parseInt(locked.amount);
  if(balance > 0) {
    let newToken = await addToken(chain, project, snob, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get farm balances:
const getFarmBalances = async (wallet: Address): Promise<(Token | LPToken)[]> => {
  let balances: (Token | LPToken)[] = [];
  let farms = await query(chain, registry, snowball.registryABI, 'tokens', []);
  let snobRewards = 0;
  let promises = farms.map((farm: any) => (async () => {
    let gauge = await query(chain, registry, snowball.registryABI, 'getGauge', [farm]);
    if(gauge != '0x0000000000000000000000000000000000000000') {
      let balance = parseInt(await query(chain, gauge, minABI, 'balanceOf', [wallet]));
      if(balance > 0) {
        let symbol = await query(chain, farm, minABI, 'symbol', []);

        // s4D StableVault:
        if(symbol === 's4D') {
          let newToken = await addS4DToken(chain, project, farm, balance, wallet);
          balances.push(newToken);

        // All Other Farms:
        } else {
          let token = await query(chain, farm, snowball.farmABI, 'token', []);
          let exchangeRatio = parseInt(await query(chain, farm, snowball.farmABI, 'getRatio', []));

          // Pangolin & Trader Joe Liquidity Pools:
          if(symbol.includes('PGL') || symbol.includes('JLP')) {
            let newToken = await addLPToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // xJOE Trader Joe Pool:
          } else if(symbol.includes('xJOE')) {
            let newToken = await addTraderJoeToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // Axial Pools:
          } else if(symbol.includes('AS4D') || symbol.includes('AC4D') || symbol.includes('AM3D') || symbol.includes('AA3D')) {
            let newToken = await addAxialToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);

          // All Other Single-Asset Pools:
          } else {
            let newToken = await addToken(chain, project, token, balance * (exchangeRatio / (10 ** 18)), wallet);
            balances.push(newToken);
          }
        }

        // Pending SNOB Rewards:
        let rewards = parseInt(await query(chain, gauge, snowball.gaugeABI, 'earned', [wallet]));
        if(rewards > 0) {
          snobRewards += rewards;
        }
      }
    }
  })());
  await Promise.all(promises);
  if(snobRewards > 0) {
    let newToken = await addToken(chain, project, snob, snobRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}