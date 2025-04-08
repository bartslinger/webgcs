<script lang="ts">
	import { Indicator, MapboxMap } from '$lib/index.js';
	import MapboxVehicle from '$lib/map/MapboxVehicle.svelte';

	let { topbar } = $props();

	let mapboxAccessToken =
		'pk.eyJ1IjoibWFwdHVyZSIsImEiOiJjbTBqbmdpbDQwemxyMmpzaGJtb2YyamYyIn0.oow6a5TOps3M4DhblMnlAA';
</script>

<div class="flex h-full w-full flex-col overflow-hidden">
	<!--	<div class="min-h-12 bg-teal-800 p-1 text-white">-->
	<!--		{@render topbar?.()}-->
	<!--	</div>-->

	<div class="h-full w-full bg-blue-300">
		<MapboxMap {mapboxAccessToken}>
			<MapboxVehicle />
		</MapboxMap>
	</div>
</div>
