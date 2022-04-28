
// Imports:
import { minABI, aave } from '../../ABIs';
import { initResponse, query, addToken, addDebtToken } from '../../functions';
import type { Request } from 'express';
import type { Chain, Address, Token, DebtToken } from 'cookietrack-types';

// Initializations:
const chain: Chain = 'avax';
const project = 'aave';
const registry: Address = '0x65285E9dfab318f57051ab2b139ccCf232945451';
const tokens: Address[] = [
  '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab', // WETH.e
  '0xd586e7f844cea2f87f50152665bcbc2c279d8d70', // DAI.e
  '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT.e
  '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', // USDC.e
  '0x63a72806098bd3d9520cc43356dd78afe5d386d9', // AAVE.e
  '0x50b7545627a5162f82a992c33b87adc75187b218', // WBTC.e
  '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'  // WAVAX
];
const incentives: Address = '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9';
const addressProviderV3: Address = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
const uiDataProviderV3: Address = '0xdBbFaFC45983B4659E368a3025b81f69Ab6E5093';
const dataProviderV3: Address = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const incentivesV3: Address = '0x929EC64c34a17401F460460D4B9390518E5B473e';
const wavax: Address = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

/* ========================================================================================================================================================================= */

// GET Function:
export const get = async (req: Request) => {

  // Initializing Response:
  let response = initResponse(req);

  // Fetching Response Data:
  if(response.status === 'ok') {
    try {
      let wallet = req.query.address as Address;
      response.data.push(...(await getMarketBalances(wallet)));
      response.data.push(...(await getIncentives(wallet)));
      response.data.push(...(await getMarketBalancesV3(wallet)));
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

// Function to get lending market balances:
const getMarketBalances = async (wallet: Address) => {
  let balances: (Token | DebtToken)[] = [];
  let promises = tokens.map(token => (async () => {
    let addresses = await query(chain, registry, aave.registryABI, 'getReserveTokensAddresses', [token]);

    // Lending Balances:
    let balance = parseInt(await query(chain, addresses.aTokenAddress, minABI, 'balanceOf', [wallet]));
    if(balance > 0) {
      let newToken = await addToken(chain, project, 'lent', token, balance, wallet);
      balances.push(newToken);
    }

    // Borrowing Balances:
    let stableDebt = parseInt(await query(chain, addresses.stableDebtTokenAddress, minABI, 'balanceOf', [wallet]));
    let variableDebt = parseInt(await query(chain, addresses.variableDebtTokenAddress, minABI, 'balanceOf', [wallet]));
    let totalDebt = stableDebt + variableDebt;
    if(totalDebt > 0) {
      let newToken = await addDebtToken(chain, project, token, totalDebt, wallet);
      balances.push(newToken);
    }
  })());
  await Promise.all(promises);
  return balances;
}

// Function to get unclaimed incentives:
const getIncentives = async (wallet: Address) => {
  let rewards = parseInt(await query(chain, incentives, aave.incentivesABI, 'getUserUnclaimedRewards', [wallet]));
  if(rewards > 0) {
    let newToken = await addToken(chain, project, 'unclaimed', wavax, rewards, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get lending market V3 balances:
const getMarketBalancesV3 = async (wallet: Address) => {
  let balances: (Token | DebtToken)[] = [];
  let assetsWithBalance: Address[] = [];
  let assets: Address[] = await query(chain, uiDataProviderV3, aave.uiDataProviderABI, 'getReservesList', [addressProviderV3]);
  let promises = assets.map(asset => (async () => {
    let data: { currentATokenBalance: number, currentStableDebt: number, currentVariableDebt: number, stableBorrowRate: number, liquidityRate: number } = await query(chain, dataProviderV3, aave.dataProviderABI, 'getUserReserveData', [asset, wallet]);
    
    // Lending Balances:
    if(data.currentATokenBalance > 0) {
      let newToken = await addToken(chain, project, 'lent', asset, data.currentATokenBalance, wallet);
      balances.push(newToken);
    }

    // Stable Borrowing Balances:
    if(data.currentStableDebt > 0) {
      let newToken = await addDebtToken(chain, project, asset, data.currentStableDebt, wallet);
      balances.push(newToken);
    }

    // Variable Borrowing Balances:
    if(data.currentVariableDebt > 0) {
      let newToken = await addDebtToken(chain, project, asset, data.currentVariableDebt, wallet);
      balances.push(newToken);
    }

    // Tracking Assets To Query Incentives For:
    if(data.currentATokenBalance > 0 || data.currentStableDebt > 0 || data.currentVariableDebt > 0) {
      assetsWithBalance.push(asset);
    }
  })());
  await Promise.all(promises);
  balances.push(...(await getIncentivesV3(assetsWithBalance, wallet)));
  return balances;
}

// Function to get unclaimed V3 incentives:
const getIncentivesV3 = async (assets: Address[], wallet: Address) => {
  if(assets.length > 0) {
    let tokens: Address[] = [];
    let promises = assets.map(asset => (async () => {
      let ibTokens: { aTokenAddress: Address, variableDebtTokenAddress: Address } = await query(chain, dataProviderV3, aave.dataProviderABI, 'getReserveTokensAddresses', [asset]);
      tokens.push(ibTokens.aTokenAddress);
      tokens.push(ibTokens.variableDebtTokenAddress);
    })());
    await Promise.all(promises);
    let rewards = parseInt(await query(chain, incentivesV3, aave.incentivesABI, 'getUserRewards', [tokens, wallet, wavax]));
    if(rewards > 0) {
      let newToken = await addToken(chain, project, 'unclaimed', wavax, rewards, wallet);
      return [newToken];
    } else {
      return [];
    }
  } else {
    return [];
  }
}