<script lang="ts">
	import { Indicator, MapboxMap } from '$lib/index.js';
	import MapboxVehicle from '$lib/map/MapboxVehicle.svelte';
	import Model3D from '$lib/3dview/Model3D.svelte';

	let { topbar, drone_state } = $props();

	let mapboxAccessToken =
		'pk.eyJ1IjoibWFwdHVyZSIsImEiOiJjbTBqbmdpbDQwemxyMmpzaGJtb2YyamYyIn0.oow6a5TOps3M4DhblMnlAA';
</script>

<div class="relative flex h-full w-full flex-col overflow-hidden">
	<!--	<div class="min-h-12 bg-teal-800 p-1 text-white">-->
	<!--		{@render topbar?.()}-->
	<!--	</div>-->

	<div class="h-full w-full bg-blue-300">
		<MapboxMap {mapboxAccessToken}>
			<MapboxVehicle {drone_state} />
		</MapboxMap>
	</div>
	<div
		class="pointer-events-none absolute top-4 left-4 aspect-video w-[1200px] rounded-md bg-gray-900/50"
	>
		<Model3D {drone_state} />
	</div>
</div>
