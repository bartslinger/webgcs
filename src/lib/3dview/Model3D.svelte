<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

	let { drone_state } = $props();

	let container: HTMLDivElement;

	const deg2rad = (deg: number) => (deg * Math.PI) / 180;

	function geodeticToLocalNed(
		lat: number,
		lon: number,
		alt: number,
		refLat: number,
		refLon: number,
		refAlt: number
	): [number, number, number] {
		const lat0Rad = deg2rad(refLat);
		const rN = 6378137.0;

		const dLat = deg2rad(lat - refLat);
		const dLon = deg2rad(lon - refLon);

		const north = dLat * rN;
		const east = dLon * rN * Math.cos(lat0Rad);
		const down = refAlt - alt;

		return [north, east, down];
	}

	let canvas_origin_alt = 100;
	let position_history: THREE.Vector3[] = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 0, 0)
	];

	onMount(() => {
		const handleResize = () => {
			const width = container.clientWidth;
			const height = container.clientHeight;

			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			camera.lookAt(new THREE.Vector3(0, 0, 0));
		};

		const width = container.clientWidth;
		const height = container.clientHeight;
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setClearColor(0x000000, 0); // 0 alpha = fully transparent
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);
		document.getElementById('model-container')?.appendChild(renderer.domElement);

		let model: any | undefined = undefined;

		const modelGroup = new THREE.Group();
		const loader = new GLTFLoader();
		loader.load('/uav_low_poly/scene.gltf', (gltf) => {
			model = gltf.scene;
			const scale = 0.35;
			model.position.set(-0.8 * scale, 0, -0.15 * scale);
			model.scale.set(scale, scale, scale);
			// rotate
			model.rotation.x = -Math.PI / 2;
			model.rotation.y = Math.PI / 2;
			modelGroup.add(model);
			scene.add(modelGroup);
		});

		const grid = new THREE.GridHelper(500, 25, 0x808080, 0x808080);
		grid.rotation.x = Math.PI / 2; // Rotate from XZ to XY
		scene.add(grid);

		// add 5 dots
		let dots: THREE.Mesh[] = [];
		const dotGeometry = new THREE.SphereGeometry(0.1, 2, 2);
		const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
		for (let i = 0; i < 5; i++) {
			const dot = new THREE.Mesh(dotGeometry, dotMaterial);
			dot.position.set(0, 0, 0);
			dots.push(dot);
			scene.add(dot);
		}
		// draw a line through the dots
		const lineMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
		const lineGeometry = new THREE.BufferGeometry().setFromPoints(position_history);
		const line = new THREE.Line(lineGeometry, lineMaterial);
		scene.add(line);
		// draw a line for the projection on target altitude
		const lineMaterial2 = new THREE.LineBasicMaterial({ color: 0x808080 });
		const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(
			dots.map((dot) => dot.position).concat([new THREE.Vector3(0, 0, 0)])
		);
		const projectionLine = new THREE.Line(lineGeometry2, lineMaterial2);
		scene.add(projectionLine);

		camera.up.set(0, 0, -1);
		camera.position.x = -30;
		camera.position.y = 0;
		camera.position.z = -10;
		camera.fov = 55;
		handleResize();

		// add lights
		const ambientLight = new THREE.AmbientLight(0xffffff, 1);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
		directionalLight.position.set(-5, 10, -10);
		scene.add(directionalLight);

		let previous_position = [0, 0, 0];
		let runAnimation = true;
		function animate() {
			if (!runAnimation) return;
			requestAnimationFrame(animate);
			let euler = new THREE.Euler(
				drone_state.attitude.roll,
				drone_state.attitude.pitch,
				drone_state.attitude.yaw,
				'ZYX'
			);

			modelGroup.rotation.copy(euler);
			modelGroup.position.z = 0; //-(drone_state.alt - canvas_origin_alt);

			canvas_origin_alt = drone_state.alt;
			const [north, east, down] = geodeticToLocalNed(
				drone_state.lat,
				drone_state.lon,
				drone_state.alt,
				drone_state.ref_lat,
				drone_state.ref_lon,
				0
			);
			if (
				north !== previous_position[0] ||
				east !== previous_position[1] ||
				down !== previous_position[2]
			) {
				position_history.push(new THREE.Vector3(north, east, down));
				position_history.shift();
				previous_position = [north, east, down];
			} else {
				return;
			}

			const translated_points = position_history.map((pos) => {
				return new THREE.Vector3(pos.x - north, pos.y - east, pos.z + canvas_origin_alt);
			});
			const projected_points = translated_points.map((pos) => {
				return new THREE.Vector3(pos.x, pos.y, canvas_origin_alt - 100);
			});
			// update dots
			for (let i = 0; i < dots.length; i++) {
				dots[i].position.x = translated_points[i].x;
				dots[i].position.y = translated_points[i].y;
				dots[i].position.z = translated_points[i].z;
			}
			// update line (from dots and finalize line to 0,0,0)
			lineGeometry.setFromPoints(translated_points);
			// update projection line
			lineGeometry2.setFromPoints(projected_points);

			grid.position.x = -(north % 20);
			grid.position.y = -(east % 20);
			grid.position.z = canvas_origin_alt;

			renderer.render(scene, camera);
		}

		animate();

		window.addEventListener('resize', handleResize, false);

		return () => {
			window.removeEventListener('resize', handleResize, false);
			runAnimation = false;
			document.getElementById('model-container')?.removeChild(renderer.domElement);
			renderer.dispose();
		};
	});
</script>

<div class="pointer-events-none absolute top-0 right-0 left-0 h-full w-full text-white">
	{drone_state.alt.toFixed(5)}
	<div bind:this={container} id="model-container" class="h-full w-full"></div>
</div>
