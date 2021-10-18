<script>

	// Imports/Exports:
	export let status;
	export let error;

	// Initializations:
	const dev = process.env.NODE_ENV === 'development';

	/* JS Goes Here */

</script>

<!-- #################################################################################################### -->

<!-- Dynamic Svelte Header -->
<svelte:head>
	<title>{status}</title>
</svelte:head>

<h1>{status}</h1>

<p>{error.message}</p>

{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}