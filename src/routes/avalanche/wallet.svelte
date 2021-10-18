<script>

	// Imports:
	import { onMount } from 'svelte';
	import { rpc_avax } from '../../RPCs.js';
	import { minABI } from '../../ABIs.js';
	import { addNativeToken, addToken } from '../../functions.js';
	import { avax_tokens } from '../../tokens/avalanche.js';

	// Initializations:
	const chain = 'avax';
	let tokens = [];

	// Function to fetch native wallet balance:
	const getAVAX = async (avax, wallet) => {
		let balance = await avax.getBalance(wallet);
		if(balance > 0) {
			let newToken = await addNativeToken(chain, balance, wallet);
			tokens = [...tokens, newToken];
		}
	}

	// Function to fetch token balances:
	const getTokenBalances = (avax, wallet) => {
		avax_tokens.forEach(async (token) => {
			let tokenContract = new ethers.Contract(token.address, minABI, avax);
			let balance = await tokenContract.balanceOf(wallet);
			if(balance > 0) {
				let newToken = await addToken(chain, 'wallet', token.address, balance, wallet, avax);
				tokens = [...tokens, newToken];
			}
		});
	}

	onMount(async () => {

		// Getting params:
		const query = window.location.search;
		const params = new URLSearchParams(query);

		// Checking params:
		if(params.has('address')) {

			// Getting wallet address:
			const wallet = params.get('address');

			// Connecting to RPC:
			const avax = new ethers.providers.JsonRpcProvider(rpc_avax);
	
			// Getting AVAX balance:
			getAVAX(avax, wallet);
	
			// Getting token balances:
			getTokenBalances(avax, wallet);

		}
	});

</script>

<!-- #################################################################################################### -->

<!-- Output -->
{ JSON.stringify(tokens) }