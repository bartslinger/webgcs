<script lang="ts">
	import { getMapContext } from '$lib/map/context.js';
	import mapboxgl from 'mapbox-gl';

	const context = getMapContext();

	let element: HTMLDivElement;
	let selected = $state(false);

	let start = [5.06370256065469, 53.25230577819744];
	const dashArraySequence = [
		[0, 4, 3],
		[0.25, 4, 2.75],
		[0.5, 4, 2.5],
		[0.75, 4, 2.25],
		[1, 4, 2],
		[1.25, 4, 1.75],
		[1.5, 4, 1.5],
		[1.75, 4, 1.25],
		[2, 4, 1],
		[2.25, 4, 0.75],
		[2.5, 4, 0.5],
		[2.75, 4, 0.25],
		[3, 4, 0],
		[0, 0.25, 3, 3.75],
		[0, 0.5, 3, 3.5],
		[0, 0.75, 3, 3.25],
		[0, 1, 3, 3],
		[0, 1.25, 3, 2.75],
		[0, 1.5, 3, 2.5],
		[0, 1.75, 3, 2.25],
		[0, 2, 3, 2],
		[0, 2.25, 3, 1.75],
		[0, 2.5, 3, 1.5],
		[0, 2.75, 3, 1.25],
		[0, 3, 3, 1],
		[0, 3.25, 3, 0.75],
		[0, 3.5, 3, 0.5],
		[0, 3.75, 3, 0.25]
	];

	let step = 0;
	function animateDashArray(timestamp) {
		if (!context.map) return;
		const layer = context.map.getLayer('line-to-mouse-layer') as mapboxgl.Layer;
		// Update line-dasharray using the next value in dashArraySequence. The
		// divisor in the expression `timestamp / 50` controls the animation speed.
		const newStep = parseInt((timestamp / 50) % dashArraySequence.length);

		if (newStep !== step) {
			console.log(layer.paint?.['line-dasharray']);
			context.map.setPaintProperty(
				'line-to-mouse-layer',
				'line-dasharray',
				dashArraySequence[newStep]
			);
			step = newStep;
		}

		// Request the next frame of the animation.
		requestAnimationFrame(animateDashArray);
	}

	const load = () => {
		if (!context.map) return;
		const marker = new mapboxgl.Marker(element, {
			anchor: 'center',
			rotationAlignment: 'map',
			rotation: 310
		})
			.setLngLat(start)
			.addTo(context.map);
		console.log(marker);

		// Add source
		context.map.addSource('line-to-mouse', {
			type: 'geojson',
			data: {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [start, start]
				}
			}
		});

		// Add layer
		context.map.addLayer({
			id: 'line-to-mouse-layer',
			type: 'line',
			source: 'line-to-mouse',
			paint: {
				'line-color': '#ffffff',
				'line-width': 2,
				'line-dasharray': [0, 4, 3]
			}
		});
		// Update line on mousemove
		context.map.on('mousemove', (e) => {
			if (!context.map) return;
			const end = [e.lngLat.lng, e.lngLat.lat];
			const source = context.map.getSource('line-to-mouse') as mapboxgl.GeoJSONSource;
			source.setData({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [start, end]
				}
			});
		});
		animateDashArray(0);
	};

	const clickMarker = (e: PointerEvent) => {
		if (!context.map) return;
		selected = !selected;
		context.map.getCanvas().style.cursor = selected ? 'pointer' : '';
		console.log('clicked it!');
	};

	let effectCounter = 0;
	$effect(() => {
		if (!context.map) return;
		effectCounter += 1;
		if (effectCounter > 1) {
			console.warn('Warning: MapboxVehicle effect called more than once');
			return;
		}
		// element.classList.remove('hidden');
		if (context.map.loaded()) {
			console.log('map loaded (immediately)');
			load();
		} else {
			console.log('registring load event');
			context.map.on('load', () => {
				console.log('map loaded (event)');
				load();
			});
		}
	});
</script>

<div class="" bind:this={element}>
	<button class="hover:cursor-pointer" onclick={clickMarker}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			stroke-width="1"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={[
				selected ? 'h-12' : 'h-10',
				selected ? 'w-12' : 'w-10',
				'fill-teal-700',
				'stroke-teal-300',
				'hover:h-12',
				'hover:w-12'
			]}
			><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
				d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z"
				transform="rotate(-90 12 12)"
			/></svg
		>
	</button>
</div>
