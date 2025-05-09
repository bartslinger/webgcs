<script lang="ts">
	import { onMount } from 'svelte';
	import {
		MavLinkPacketParser,
		MavLinkPacketSplitter,
		MavLinkProtocolV2
	} from '$lib/mavlink/mavlink.js';
	import { ardupilotmega, common, type MavLinkPacketRegistry, minimal } from 'mavlink-mappings';
	import { Heartbeat } from 'mavlink-mappings/dist/lib/minimal.js';
	import { BasicLayout, Indicator } from '$lib/index.js';
	import { Attitude, GlobalPositionInt } from 'mavlink-mappings/dist/lib/common.js';

	const REGISTRY: MavLinkPacketRegistry = {
		...minimal.REGISTRY,
		...common.REGISTRY,
		...ardupilotmega.REGISTRY
	};

	let drone_state = $state({
		ref_lat: 0,
		ref_lon: 0,
		lat: 0,
		lon: 0,
		alt: 0,
		heading: 0,
		attitude: {
			roll: 0,
			pitch: 0,
			yaw: 0
		}
	});

	let protocol = new MavLinkProtocolV2();
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
					// console.log('>', data);
					if (data instanceof Heartbeat) {
						// console.log(data);
					} else if (data instanceof GlobalPositionInt) {
						drone_state.lat = data.lat * 1e-7;
						drone_state.lon = data.lon * 1e-7;
						if (!drone_state.ref_lat && !drone_state.ref_lon) {
							drone_state.ref_lat = data.lat * 1e-7;
							drone_state.ref_lon = data.lon * 1e-7;
						}
						drone_state.alt = data.alt * 1e-3;
						drone_state.heading = data.hdg * 1e-2;
					} else if (data instanceof Attitude) {
						drone_state.attitude.roll = data.roll;
						drone_state.attitude.pitch = data.pitch;
						drone_state.attitude.yaw = data.yaw;
					}
				} else {
					console.log('!', message.debug());
				}
			}
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

<BasicLayout {drone_state}>
	{#snippet topbar()}
		this goes in the top bar
		<Indicator value={42} />
		<Indicator value={43} />
	{/snippet}
</BasicLayout>
