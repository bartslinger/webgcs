<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import { onDestroy, onMount } from 'svelte';
	import { type MapContext, setMapContext } from '$lib/map/context.js';
	import Indicator from '$lib/value/Indicator.svelte';
	import 'mapbox-gl/dist/mapbox-gl.css';

	interface Props {
		mapboxAccessToken: string;
		children?: () => any;
	}

	let { mapboxAccessToken, children }: Props = $props();

	let mapContainer: HTMLDivElement;

	const context: MapContext = $state({
		map: undefined,
		someNumber: 42
	});

	setMapContext(context);

	function loadMap() {
		context.map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapture/cm2cwgspw004e01phfftf4mgx',
			center: [0, 0],
			zoom: 1,
			accessToken: mapboxAccessToken
		});
		context.map.addControl(new mapboxgl.NavigationControl());
		context.map.flyTo({
			center: [4.988952217491402, 53.27484145233723],
			zoom: 12,
			speed: 15
		});
	}

	onMount(() => {
		setTimeout(() => {
			loadMap();
		}, 500);
	});

	onDestroy(() => {
		if (context.map) context.map.remove();
	});
</script>

<div class="h-full w-full bg-green-300" bind:this={mapContainer}></div>
<!--Stuff below here is actually rendered but not visible because of overflow-none-->
{@render children?.()}
