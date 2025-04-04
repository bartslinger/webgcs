<script lang="ts">
	import { Button } from 'flowbite-svelte';

	let heading = 'Mavlink compatible Ground Control Station';
	// let heading = 'Plug and Play Ground Control Station';
	// proper hero section heading
	// let heading = '';

	let subheading =
		'WebGCS is a web-based ground control station for UAVs that is compatible with Mavlink protocol.';
</script>

<div
	class="mx-auto grid max-w-screen-xl gap-12 px-4 py-8 pt-20 lg:min-h-screen lg:grid-cols-12 lg:gap-8 lg:py-32 xl:gap-0"
>
	<div class="mr-auto place-self-center lg:col-span-7">
		<div>
			<h1
				class="mb-4 max-w-2xl text-4xl leading-none font-extrabold tracking-tight md:text-5xl xl:text-6xl dark:text-white"
			>
				{heading}
			</h1>
			<p
				class="mb-6 max-w-2xl font-light text-gray-500 md:text-lg lg:mb-8 lg:text-xl dark:text-gray-400"
			>
				{subheading}
			</p>
			<div class="flex justify-center lg:justify-start">
				<Button
					size="xl"
					color="dark"
					class="mr-3 inline-flex items-center justify-center bg-teal-700 hover:bg-teal-800"
					href="/">Fly Now<!--<IconArrowRight class="-mr-1 ml-2" />--></Button
				>
				<Button
					color="light"
					size="xl"
					class="inline-flex items-center justify-center"
					href="roadmap">Roadmap</Button
				>
			</div>
		</div>
	</div>
	<div class="flex items-center justify-center lg:col-span-5 lg:mt-0 lg:flex">
		<img src="webgcs-small.png" class="w-full max-w-lg rounded-lg shadow-lg" alt="mockup" />
	</div>
</div>

<section class="bg-white lg:-mt-24 dark:bg-gray-900">
	<div
		class="mx-auto grid max-w-screen-xl items-start gap-16 px-4 py-8 lg:grid-cols-2 lg:space-y-0 lg:px-6 lg:py-16"
	>
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2
				class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white"
			>
				All you need is a web browser
			</h2>
			<p class="mb-4">
				Because WebGCS runs in the browser, it is compatible with <span class="font-semibold"
					>all operating systems</span
				>
				and devices. You can use it on your desktop, laptop, tablet, or smartphone. No installation is
				required.
			</p>
			<p>
				It is also possible to install it as a PWA (Progressive Web App) on your device, so you can <span
					class="font-semibold">use it offline</span
				> as well.
			</p>
		</div>
		<!--		<div class="mt-8 grid grid-cols-2 gap-4"></div>-->
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2
				class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white"
			>
				Designed for multi-vehicle operations
			</h2>
			<p class="mb-4">
				Connect multiple vehicles to WebGCS and control them simultaneously. Select a vehicle or
				group of vehicles to monitor and control. You can also switch between vehicles with a single
				click.
			</p>
			<p>
				Mix and match different types of vehicles, such as drones, rovers, boats, and submarines.
				WebGCS is designed to be <span class="font-semibold">flexible and scalable</span>.
			</p>
		</div>
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2
				class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white"
			>
				Open source
			</h2>
			<p class="mb-4">
				WebGCS is an open-source project. The source code is available on GitHub, so you can use it
				to build your own custom ground control station or contribute to the project.
			</p>
			<p>
				The project is licensed as LGPL-3.0, so you can use it for personal or commercial purposes.
			</p>
		</div>
		<!--		<div class="mt-8 grid grid-cols-2 gap-4"></div>-->
	</div>
</section>
