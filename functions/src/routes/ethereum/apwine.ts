
// Imports:
import { minABI, apwine, paladin, aave, harvest } from '../../ABIs';
import { initResponse, query, addToken } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address, Token } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'eth';
const project = 'apwine';
const registry: Address = '0x72d15EAE2Cd729D8F2e41B1328311f3e275612B9';
const apw: Address = '0x4104b135DBC9609Fc1A9490E61369036497660c8';
const veapw: Address = '0xC5ca1EBF6e912E49A6a70Bb0385Ea065061a4F09';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getFutureBalances(wallet)));
      response.data.push(...(await getStakedAPW(wallet)));
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

// Function to get future balances:
const getFutureBalances = async (wallet: Address) => {
  let balances: Token[] = [];
  let poolLength = parseInt(await query(chain, registry, apwine.registryABI, 'futureVaultCount', []));
  let futures = [...Array(poolLength).keys()];
  let promises = futures.map(futureID => (async () => {
    let future = await query(chain, registry, apwine.registryABI, 'getFutureVaultAt', [futureID]);
    let currentPeriod = parseInt(await query(chain, future, apwine.futureABI, 'getCurrentPeriodIndex', []));

    // Fetching PT Balance:
    let pt = await query(chain, future, apwine.futureABI, 'getPTAddress', []);
    let ptBalance = parseInt(await query(chain, pt, minABI, 'balanceOf', [wallet]));
    if(ptBalance > 0) {
      let platform = await query(chain, future, apwine.futureABI, 'PLATFORM_NAME', []);
      let futureToken = await query(chain, future, apwine.futureABI, 'getIBTAddress', []);
      let futureTokenDecimals = parseInt(await query(chain, futureToken, minABI, 'decimals', []));
      let underlyingToken: Address | undefined;
      let underlyingExchangeRate: number | undefined;

      // StakeDAO Futures:
      if(platform === 'StakeDAO') {
        if(futureToken.toLowerCase() === '0xac14864ce5a98af3248ffbf549441b04421247d3') { // xSDT
          underlyingToken = '0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F'; // SDT
          let stakedSupply = parseInt(await query(chain, futureToken, minABI, 'totalSupply', []));
          let underlyingTokenStaked = parseInt(await query(chain, underlyingToken, minABI, 'balanceOf', [futureToken]));
          underlyingExchangeRate = underlyingTokenStaked / stakedSupply;
        } else {
          console.info(`Unsupported StakeDAO FutureID on APWine: ${futureID}`);
        }

      // IDLE Finance Futures:
      } else if(platform === 'IDLE Finance') {
        console.info(`Unsupported IDLE Finance FutureID on APWine: ${futureID}`);

      // Lido Futures:
      } else if(platform === 'Lido') {
        underlyingToken = futureToken;
        underlyingExchangeRate = 1;

      // Yearn Futures:
      } else if(platform === 'Yearn') {
        console.info(`Unsupported Yearn FutureID on APWine: ${futureID}`);

      // Harvest Futures:
      } else if(platform === 'Harvest') {
        underlyingToken = await query(chain, futureToken, harvest.stakingABI, 'underlying', []);
        underlyingExchangeRate = parseInt(await query(chain, futureToken, harvest.stakingABI, 'getPricePerFullShare', [])) / (10 ** 18);

      // TrueFi Futures:
      } else if(platform === 'TrueFi') {
        console.info(`Unsupported TrueFi FutureID on APWine: ${futureID}`);

      // Aave Futures:
      } else if(platform === 'Aave') {
        underlyingToken = await query(chain, futureToken, aave.lendingABI, 'UNDERLYING_ASSET_ADDRESS', []);
        underlyingExchangeRate = 1;

      // Olympus Futures:
      } else if(platform === 'Olympus') {
        underlyingToken = futureToken;
        underlyingExchangeRate = 1;

      // Sushi Futures:
      } else if(platform === 'Sushi') {
        underlyingToken = futureToken;
        underlyingExchangeRate = 1;

      // Paladin Futures:
      } else if(platform === 'Paladin') {
        let pool = await query(chain, futureToken, paladin.tokenABI, 'palPool', []);
        let poolToken = await query(chain, pool, paladin.poolABI, 'underlying', []);
        underlyingToken = await query(chain, poolToken, aave.stakingABI, 'STAKED_TOKEN', []);
        underlyingExchangeRate = parseInt(await query(chain, pool, paladin.poolABI, 'exchangeRateStored', [])) / (10 ** 18);

      // ParaSwap Futures:
      } else if(platform === 'ParaSwap') {
        underlyingToken = '0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5'; // PSP
        underlyingExchangeRate = parseInt(await query(chain, futureToken, apwine.futureTokenABI, 'PSPForSPSP', [10 ** 6])) / (10 ** 6);
      } else {
        console.warn(`Unidentified APWine Future Platform: ${platform}`);
      }

      // Adding Underlying Token:
      if(underlyingToken && underlyingExchangeRate) {
        let newToken = await addToken(chain, project, 'staked', underlyingToken, ptBalance * underlyingExchangeRate, wallet);
        balances.push(newToken);
  
        // Fetching FYT Balances:
        for(let period = 1; period <= currentPeriod; period++) {
          let fyt = await query(chain, future, apwine.futureABI, 'getFYTofPeriod', [period]);
          let fytBalance = parseInt(await query(chain, fyt, minABI, 'balanceOf', [wallet]));
          if(fytBalance > 0) {
            let unrealisedYield = parseInt(await query(chain, future, apwine.futureABI, 'getUnrealisedYieldPerPT', [])) / (10 ** futureTokenDecimals);
            if(unrealisedYield > 0) {
              let intermediateRate = parseInt(await query(chain, future, apwine.futureABI, 'getIBTRate', [])) / (10 ** futureTokenDecimals);
              let exchangeRate = unrealisedYield * intermediateRate;
              let actualFytBalance = fytBalance * exchangeRate;
              let newToken = await addToken(chain, project, 'unclaimed', underlyingToken, actualFytBalance * underlyingExchangeRate, wallet);
              balances.push(newToken);
            }
          }
        }
      }
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get staked APW balance:
const getStakedAPW = async (wallet: Address) => {
  let locked = await query(chain, veapw, apwine.stakingABI, 'locked', [wallet]);
  let balance = parseInt(locked.amount);
  if(balance > 0) {
    let newToken = await addToken(chain, project, 'staked', apw, balance, wallet);
    return [newToken];
  } else {
    return [];
  }
}