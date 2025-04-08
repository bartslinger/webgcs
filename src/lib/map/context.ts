import { getContext, setContext } from 'svelte';
import mapboxgl from 'mapbox-gl';

const key = 'map-context';

export type MapContext = {
	map: mapboxgl.Map | undefined;
	someNumber: number;
};

export function getMapContext() {
	return getContext(key) as MapContext;
}

export function setMapContext(context: MapContext) {
	const mapContext = getMapContext();
	if (mapContext) {
		throw new Error('Map context already set');
	}
	setContext(key, context);
	return context;
}
