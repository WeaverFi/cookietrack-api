
// Imports:
const { ethers } = require('ethers');
const { minABI, penguin } = require('../../static/ABIs.js');
const { query, addToken, addLPToken } = require('../../static/functions.js');

// Initializations:
const chain = 'avax';
const project = 'penguin';
const iglooMaster = '0x256040dc7b3CECF73a759634fc68aA60EA0D68CB';
const nest = '0xE9476e16FE488B90ada9Ab5C7c2ADa81014Ba9Ee';
const clubPenguin = '0x86e8935a8F20231dB4b44A2ac3848Fbf44d22ec8';
const pefi = '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c';

/* ========================================================================================================================================================================= */

// GET Function:
exports.get = async (req) => {

  // Initializing Response:
  let response = {
    status: 'ok',
    data: [],
    request: req.originalUrl
  }

  // Getting Wallet Address:
  const wallet = req.query.address;

  // Checking Parameters:
  if(wallet != undefined) {
    if(ethers.utils.isAddress(wallet)) {
      try {
        response.data.push(...(await getIglooBalances(wallet)));
        response.data.push(...(await getStakedPEFI(wallet)));
        response.data.push(...(await getClubPenguinBalance(wallet)));
      } catch(err) {
        console.error(err);
        response.status = 'error';
        response.data = [{error: 'Internal API Error'}];
      }
    } else {
      response.status = 'error';
      response.data = [{error: 'Invalid Wallet Address'}];
    }
  } else {
    response.status = 'error';
    response.data = [{error: 'No Wallet Address in Request'}];
  }

  // Returning Response:
  return JSON.stringify(response);
}

/* ========================================================================================================================================================================= */

// Function to get Igloo balances:
const getIglooBalances = async (wallet) => {
  let balances = [];
  let iglooCount = parseInt(await query(chain, iglooMaster, penguin.masterABI, 'poolLength', []));
  let igloos = [...Array(iglooCount).keys()];
  let pefiRewards = 0;
  let promises = igloos.map(iglooID => (async () => {
    let balance = parseInt((await query(chain, iglooMaster, penguin.masterABI, 'userInfo', [iglooID, wallet])).amount);
    if(balance > 0) {
      let token = (await query(chain, iglooMaster, penguin.masterABI, 'poolInfo', [iglooID])).poolToken;
      let newToken = await addLPToken(chain, project, token, balance, wallet);
      balances.push(newToken);
      let pendingPEFI = parseInt(await query(chain, iglooMaster, penguin.masterABI, 'totalPendingPEFI', [iglooID, wallet]));
      if(pendingPEFI > 0) {
        pefiRewards += pendingPEFI;
      }
      let pendingBonus = await query(chain, iglooMaster, penguin.masterABI, 'pendingTokens', [iglooID, wallet]);
      if(pendingBonus[0].length > 2) {
        if(parseInt(pendingBonus[1][2]) > 0) {
          let newToken = await addToken(chain, project, pendingBonus[0][2], parseInt(pendingBonus[1][2]), wallet);
          balances.push(newToken);
        }
      }
    }
  })());
  await Promise.all(promises);
  if(pefiRewards > 0) {
    let newToken = await addToken(chain, project, pefi, pefiRewards, wallet);
    balances.push(newToken);
  }
  return balances;
}

// Function to get staked PEFI balance:
const getStakedPEFI = async (wallet) => {
  let balance = parseInt(await query(chain, nest, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let exchangeRate = parseInt(await query(chain, nest, penguin.nestABI, 'currentExchangeRate', [])) / (10 ** 18);
    let newToken = await addToken(chain, project, pefi, balance * exchangeRate, wallet);
    return [newToken];
  } else {
    return [];
  }
}

// Function to get Club Penguin balance:
const getClubPenguinBalance = async (wallet) => {
  let balance = parseInt(await query(chain, clubPenguin, minABI, 'balanceOf', [wallet]));
  if(balance > 0) {
    let exchangeRate = parseInt(await query(chain, nest, penguin.nestABI, 'currentExchangeRate', [])) / (10 ** 18);
    let newToken = await addToken(chain, project, pefi, balance * exchangeRate, wallet);
    return [newToken];
  } else {
    return [];
  }
}