<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { IconArrowRight } from '@tabler/icons-svelte';

	let heading = 'Mavlink compatible Ground Control Station';
	// let heading = 'Plug and Play Ground Control Station';
	// proper hero section heading
	// let heading = '';

	let subheading =
		'WebGCS is a web-based ground control station for UAVs that is compatible with Mavlink protocol.';
</script>

<div
	class="mx-auto grid min-h-screen max-w-screen-xl px-4 py-8 pt-20 lg:grid-cols-12 lg:gap-8 lg:py-32 xl:gap-0"
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
			<Button size="xl" color="dark" class="mr-3 inline-flex items-center justify-center" href="/"
				>Fly Now<IconArrowRight class="-mr-1 ml-2" /></Button
			>
			<Button color="light" size="xl" class="inline-flex items-center justify-center" href="/"
				>Documentation</Button
			>
		</div>
	</div>
	<div class=" items-center lg:col-span-5 lg:mt-0 lg:flex">
		<img src="webgcs-small.png" class="rounded-lg shadow-lg" alt="mockup" />
	</div>
</div>

<section class="bg-white dark:bg-gray-900">
	<div
		class="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16"
	>
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
				All you need is a web browser
			</h2>
			<p class="mb-4">
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick, but big enough to deliver the scope you want at the pace you need.
				Small enough to be simple and quick, but big enough to deliver the scope you want at the
				pace you need.
			</p>
			<p>
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick.
			</p>
		</div>
		<div class="mt-8 grid grid-cols-2 gap-4">
			<img
				class="w-full rounded-lg"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-2.png"
				alt="office content 1"
			/>
			<img
				class="mt-4 w-full rounded-lg lg:mt-10"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-1.png"
				alt="office content 2"
			/>
		</div>
		<div class="mt-8 grid grid-cols-2 gap-4">
			<img
				class="w-full rounded-lg"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-2.png"
				alt="office content 1"
			/>
			<img
				class="mt-4 w-full rounded-lg lg:mt-10"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-1.png"
				alt="office content 2"
			/>
		</div>
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
				Designed for multi-vehicle operations
			</h2>
			<p class="mb-4">
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick, but big enough to deliver the scope you want at the pace you need.
				Small enough to be simple and quick, but big enough to deliver the scope you want at the
				pace you need.
			</p>
			<p>
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick.
			</p>
		</div>
		<div class="font-light text-gray-500 sm:text-lg dark:text-gray-400">
			<h2 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
				Open source
			</h2>
			<p class="mb-4">
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick, but big enough to deliver the scope you want at the pace you need.
				Small enough to be simple and quick, but big enough to deliver the scope you want at the
				pace you need.
			</p>
			<p>
				We are strategists, designers and developers. Innovators and problem solvers. Small enough
				to be simple and quick.
			</p>
		</div>
		<div class="mt-8 grid grid-cols-2 gap-4">
			<img
				class="w-full rounded-lg"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-2.png"
				alt="office content 1"
			/>
			<img
				class="mt-4 w-full rounded-lg lg:mt-10"
				src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-1.png"
				alt="office content 2"
			/>
		</div>
	</div>
</section>
