<script lang="ts">
	import { BasicLayout, Indicator } from '$lib';
	import { onMount } from 'svelte';

	let ws: WebSocket;
	let retry = true;
	let reconnectTimeout = 1000; // Initial reconnection delay (1 second)
	const connectWebSocket = () => {
		ws = new WebSocket(`ws://localhost:3000/ws`); // Replace with your WebSocket URL
		ws.binaryType = 'arraybuffer';

		ws.onopen = () => {
			console.log('WebSocket connected');
			reconnectTimeout = 1000; // Reset the reconnect delay on successful connection
		};

		ws.onmessage = (event: MessageEvent) => {
			console.log(event.data);
		};

		ws.onclose = () => {
			console.log('WebSocket closed. Reconnecting...');

			if (retry) {
				attemptReconnect();
			}
		};

		ws.onerror = (err) => {
			console.error('WebSocket error', err);
			ws.close(); // Close connection on error
		};
	};

	const attemptReconnect = () => {
		setTimeout(() => {
			console.log('Attempting to reconnect...');
			reconnectTimeout = Math.min(reconnectTimeout * 2, 5000); // Exponential backoff with cap
			connectWebSocket(); // Try to reconnect
		}, reconnectTimeout);
	};

	onMount(() => {
		// let hostname = window.location.hostname;
		// if (hostname !== 'localhost') {
		// }
		connectWebSocket();

		return () => {
			if (ws) {
				retry = false; // To prevent attempt at reconnecting
				ws.close(); // Clean up the WebSocket on component unmount
			}
		};
	});
</script>

<BasicLayout>
	{#snippet topbar()}
		this goes in the top bar
		<Indicator value={42} />
		<Indicator value={43} />
	{/snippet}
</BasicLayout>
