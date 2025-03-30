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

<header class="bg-opacity-75 absolute top-0 z-30 w-full bg-white backdrop-blur-sm backdrop-filter">
	<div class="mx-auto flex max-w-screen-xl items-center justify-between overflow-x-auto px-4 py-3">
		<div class="flex items-center">
			<div class="ml-2 text-xl font-extrabold italic">
				<span class="text-orange-500">WEB</span>GCS
			</div>
		</div>
		<div class="ml-1 flex items-center space-x-0 md:space-x-1">
			<a href="https://kutty.netlify.app/docs/" rel="prefetch" class="btn btn-sm btn-link"
				><span class="hidden md:inline">Documentation</span>
				<span class="inline md:hidden">Docs</span></a
			>
			<a href="https://kutty.netlify.app/components/" rel="prefetch" class="btn btn-sm btn-light"
				>Components</a
			>
			<a
				href="https://github.com/praveenjuge/kutty/"
				class="btn btn-sm btn-link"
				target="_blank"
				rel="noopener noreferrer"
				><span class="sr-only">GitHub</span><svg
					class="h-6 w-5"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="currentcolor"
					aria-hidden="true"
					><path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M12.026 2c-5.509.0-9.974 4.465-9.974 9.974.0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481.0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93.0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64.0.0.837-.269 2.742 1.021.798-.221 1.649-.332 2.496-.336.849.004 1.701.115 2.496.336 1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675.0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846.0 1.334-.012 2.41-.012 2.737.0.267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
					></path></svg
				></a
			>
		</div>
	</div>
</header>
<div
	class="mx-auto mt-8 grid min-h-screen max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-8 lg:py-32 xl:gap-0"
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
			<Button size="xl" color="dark" class="mr-3 inline-flex items-center justify-center"
				>Fly Now<IconArrowRight class="-mr-1 ml-2" /></Button
			>
			<Button color="light" size="xl" class="inline-flex items-center justify-center"
				>Documentation</Button
			>
		</div>
	</div>
	<div class=" items-center lg:col-span-5 lg:mt-0 lg:flex">
		<img src="webgcs-small.png" class="rounded-lg shadow-lg" alt="mockup" />
	</div>
</div>
<div class="min-h-[300px] bg-blue-300">learn more</div>
