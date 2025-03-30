<script lang="ts">
	import { app_state } from '$lib/state.svelte.js';

	let { value } = $props();

	app_state.increment();
</script>

Indicator: {value} (count: {app_state.count})
