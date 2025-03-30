<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		mapbox_access_token: string;
	}

	let { mapbox_access_token }: Props = $props();

	let map_container: HTMLDivElement;
	let map: mapboxgl.Map;

	function loadMap() {
		map = new mapboxgl.Map({
			container: map_container,
			style: 'mapbox://styles/mapture/cm2cwgspw004e01phfftf4mgx',
			center: [0, 0],
			zoom: 1,
			accessToken: mapbox_access_token
		});
		map.addControl(new mapboxgl.NavigationControl());
	}

	onMount(() => {
		loadMap();
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<div class="h-full w-full bg-green-300" bind:this={map_container}></div>
