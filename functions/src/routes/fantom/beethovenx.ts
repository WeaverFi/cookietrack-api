
// Imports:
import { minABI, beethovenx } from '../../ABIs';
import { initResponse, query, addBalancerLikeToken, addToken } from '../../functions';
import type { Request } from 'express';
import { Chain, Address, Token, LPToken, isToken } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'ftm';
const project = 'beethovenx';
export const vault: Address = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce';
export const masterChef: Address = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
export const fBeetAddress: Address = '0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1';
export const fBeetLogo = 'https://beets.fi/img/fBEETS.d7f7145f.png';
const beetsToken: Address = '0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e';
const poolIDs: Address[] = require('../../../static/beethovenx-pools.json').pools;
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
      response.data.push(...(await getStakedBalances(wallet)));
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

// Function to get all pool balances:
const getPoolBalances = async (wallet: Address) => {
  const balances: (Token | LPToken)[] = [];
  const promises = poolIDs.map(id => (async () => {
    const address = (await query(chain, vault, beethovenx.vaultABI, 'getPool', [id]))[0];
    const balance = parseInt(await query(chain, address, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      const newToken = await addBalancerLikeToken(chain, project, 'liquidity', address, balance, wallet, id, vault);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}

/* ========================================================================================================================================================================= */

// Function to get all staked pool balances and pending rewards
const getStakedBalances = async (wallet: Address) => {
  const balances: (Token | LPToken)[] = [];
  const numRewardsPools: number = await query(chain, masterChef, beethovenx.masterChefABI, 'poolLength', []);
  const promises: Promise<void>[] = [];
  let pendingBeets = 0;
  for(let poolNum = 0; poolNum < numRewardsPools; poolNum++) {
    promises.push((async () => {
      const walletInfo = await query(chain, masterChef, beethovenx.masterChefABI, 'userInfo', [poolNum, wallet]);
      const balance = parseInt(walletInfo.amount);
      const poolBeets = parseInt(await query(chain, masterChef, beethovenx.masterChefABI, 'pendingBeets', [poolNum, wallet]));
      if (balance > 0) {
        const poolAddress: Address = await query(chain, masterChef, beethovenx.masterChefABI, 'lpTokens', [poolNum]);
        // Ignore fBeet address (for some reason it's in this list, but is not an LP token???)
        if (poolAddress !== fBeetAddress) {
          const poolId: Address = await query(chain, poolAddress, beethovenx.poolABI, 'getPoolId', []);
          const newToken = await addBalancerLikeToken(chain, project, 'staked', poolAddress, balance, wallet, poolId, vault);
          if (isToken(newToken)) {
            newToken.logo = fBeetLogo; // fBeet logo
          }
          balances.push(newToken);
        }
      }
      if (poolBeets > 0) {
        pendingBeets += poolBeets;
      }
    })());
  }
  await Promise.all(promises);
  if (pendingBeets > 0) {
    const beets = await addToken(chain, project, 'unclaimed', beetsToken, pendingBeets, wallet);
    balances.push(beets);
  }
  return balances;
}
