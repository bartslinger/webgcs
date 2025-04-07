<script lang="ts">
	import { BasicLayout, Indicator } from '$lib';
	import { onMount } from 'svelte';
	import { MavLinkPacketParser, MavLinkPacketSplitter } from '$lib/mavlink/mavlink.js';
	import { ardupilotmega, common, type MavLinkPacketRegistry, minimal } from 'mavlink-mappings';
	import { Heartbeat } from 'mavlink-mappings/dist/lib/minimal.js';

	const REGISTRY: MavLinkPacketRegistry = {
		...minimal.REGISTRY,
		...common.REGISTRY,
		...ardupilotmega.REGISTRY
	};

	let parser = new MavLinkPacketParser();
	let splitter = new MavLinkPacketSplitter();

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
			const packets = splitter.parse(event.data);
			for (const packet of packets) {
				const message = parser.parse({ buffer: packet });
				const payload = new DataView(message.payload);
				const clazz = REGISTRY[message.header.msgid];
				if (clazz) {
					const data = message.protocol.data(payload, clazz);
					console.log('>', data);
				} else {
					console.log('!', message.debug());
				}
			}
			// const packets = parser.parse({ buffer: event.data });
			// for (const packet of packets) {
			// 	const payload = new DataView(packet.payload);
			// 	const clazz = REGISTRY[packet.header.msgid];
			// 	if (clazz) {
			// 		const data = packet.protocol.data(payload, clazz);
			// 		console.log('>', data);
			// 	} else {
			// 		console.log('!', packet.debug());
			// 	}
			// }
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
