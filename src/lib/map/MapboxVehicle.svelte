<script lang="ts">
	import { getMapContext } from '$lib/map/context.js';
	import mapboxgl from 'mapbox-gl';
	import {
		azimuthToBearing,
		bearing,
		bearingToAzimuth,
		destination,
		distance,
		lineArc
	} from '@turf/turf';

	let { drone_state } = $props();

	const context = getMapContext();

	let uavElement: HTMLDivElement;
	let gotoWaypointPopupElement: HTMLDivElement;
	let selected = $state(false);
	let marker: mapboxgl.Marker | undefined = undefined;

	let start: [number, number] = [5.06370256065469, 53.25230577819744];
	let heading = 310;
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
		// Update line-dasharray using the next value in dashArraySequence. The
		// divisor in the expression `timestamp / 50` controls the animation speed.
		const newStep = parseInt((timestamp / 50) % dashArraySequence.length);

		if (newStep !== step) {
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

	const drawFuturePath = (to: null | [number, number]) => {
		if (!context.map) return;
		const source = context.map.getSource('line-to-mouse') as mapboxgl.GeoJSONSource;
		const end = to;
		if (!end) {
			// remove the line
			source.setData({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: []
				}
			});
			return;
		}
		const turnAngle = azimuthToBearing(bearing(start, end) - heading);

		// calculate circle center points
		let arcCenter = destination(start, 500, heading + Math.sign(turnAngle) * 90, {
			units: 'meters'
		});
		// calculate the bearing between the two points
		const x = distance(arcCenter, end, { units: 'meters' });
		const b = bearing(arcCenter.geometry.coordinates, end);
		let arcEnd = b - Math.sign(turnAngle) * Math.acos(500 / x) * (180 / Math.PI);
		if (!Number.isFinite(arcEnd)) {
			return;
		}
		let arcStart = heading - Math.sign(turnAngle) * 90;

		if (turnAngle < 0) {
			const temp = arcEnd;
			arcEnd = arcStart;
			arcStart = temp;
		}
		let arcAngle = Math.abs(bearingToAzimuth(arcEnd - arcStart));
		const arc = lineArc(arcCenter, 500, arcStart, arcEnd, {
			units: 'meters',
			steps: Math.ceil(arcAngle / 10)
		});

		// add one last line segment to start
		// invert list of the coordinates
		if (turnAngle < 0) {
			arc.geometry.coordinates.reverse();
		}
		arc.geometry.coordinates.push(end);
		source.setData({
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: arc.geometry.coordinates
			},
			properties: {}
		});
	};

	const load = () => {
		if (!context.map) return;
		marker = new mapboxgl.Marker(uavElement, {
			anchor: 'center',
			rotationAlignment: 'map',
			rotation: heading
		})
			.setLngLat(start)
			.addTo(context.map);

		// Add source
		context.map.addSource('line-to-mouse', {
			type: 'geojson',
			data: {
				type: 'Feature',
				properties: {},
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
		});

		context.map.on('click', (e) => {
			if (!context.map) return;
			const coords = e.lngLat.toArray();
			if (selected) {
				drawFuturePath(coords as [number, number]);
				new mapboxgl.Popup()
					.setLngLat(e.lngLat)
					.setDOMContent(gotoWaypointPopupElement)
					.on('close', (e) => {
						drawFuturePath(null);
					})
					.addTo(context.map);
			} else {
				drawFuturePath(null);
			}
		});
		animateDashArray(0);
	};

	const clickMarker = (e: PointerEvent) => {
		if (!context.map) return;
		selected = !selected;
		if (!selected) {
			console.log('deleting the path');
			drawFuturePath(null);
		}
		context.map.getCanvas().style.cursor = selected ? 'crosshair' : '';
		console.log('clicked it!');
	};

	$effect(() => {
		// Fucking hell, svelte is not the magic framework to rule them all. The order here matters
		// Fuck this shit
		const coords = [drone_state.lon, drone_state.lat] as [number, number];
		if (!marker) return;
		marker.setLngLat(coords);
	});

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

<div
	class="grid grid-cols-2 overflow-hidden rounded-lg bg-teal-900 text-white"
	bind:this={gotoWaypointPopupElement}
>
	<h2 class="col-span-2 flex justify-center p-2 text-lg font-semibold">goto waypoint?</h2>
	<button class="flex w-20 justify-center bg-green-500 p-2 text-white">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-check"
			><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l5 5l10 -10" /></svg
		>
	</button>
	<button class="flex w-20 justify-center bg-red-500 p-2 text-white">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-x"
			><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path
				d="M6 6l12 12"
			/></svg
		>
	</button>
</div>
<div class="" bind:this={uavElement}>
	<button aria-label="select-uav" class="hover:cursor-pointer" onclick={clickMarker}>
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

<style>
	:global(.mapboxgl-popup-anchor-top) {
		border-top-color: red;
		border-left-color: red;
	}
	:global(.mapboxgl-popup-content) {
		padding: 0px;
		background: transparent;
	}
	:global(.mapboxgl-popup-close-button) {
		display: none;
	}
</style>
