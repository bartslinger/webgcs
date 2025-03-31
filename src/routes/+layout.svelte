<script lang="ts">
	import '../app.css';
	import IconBuildingAirport from '$lib/tabler-icons/IconBuildingAirport.svelte';
	let { children } = $props();

	let menu_open = false;
</script>

<nav class="absolute top-0 w-full border-gray-200 dark:bg-gray-900">
	<div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
		<a href="/" class="flex items-center space-x-1 rtl:space-x-reverse">
			<!--			<img src="https://flowbite.com/docs/images/logo.svg" class="h-8" alt="Flowbite Logo" />-->
			<IconBuildingAirport class="h-6 w-6" stroke-width="2" />
			<div class="text-xl font-extrabold">
				<span class="text-teal-700 italic">WEB</span>GCS
			</div>
		</a>
		<button
			data-collapse-toggle="navbar-default"
			onclick={() => (menu_open = !menu_open)}
			type="button"
			class="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
			aria-controls="navbar-default"
			aria-expanded="false"
		>
			<span class="sr-only">Open main menu</span>
			<svg
				class="h-5 w-5"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 17 14"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M1 1h15M1 7h15M1 13h15"
				/>
			</svg>
		</button>
		<div class={['w-full md:block md:w-auto', menu_open ? 'block' : 'hidden']} id="navbar-default">
			<ul
				class="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-900"
			>
				<li>
					<a
						href="/"
						class="block rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-teal-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
						>Roadmap</a
					>
				</li>
				<li>
					<a
						href="/"
						class="block rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-teal-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
						>Documentation</a
					>
				</li>
				<li>
					<a
						href="/"
						class="block rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-teal-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
						>About</a
					>
				</li>
				<li>
					<a
						href="/"
						target="_blank"
						class="block rounded-sm px-3 py-2 text-gray-900 hover:bg-gray-100 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-teal-600 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-blue-500"
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
				</li>
			</ul>
		</div>
	</div>
</nav>
{@render children()}

<footer class="bg-white p-4 sm:p-6 dark:bg-gray-800">
	<div class="mx-auto max-w-screen-xl">
		<!--		<div class="md:flex md:justify-between bg-red-300">-->
		<!--			<div class="mb-6 md:mb-0">-->
		<!--				<a href="https://flowbite.com" class="flex items-center">-->
		<!--					<img-->
		<!--						src="https://flowbite.com/docs/images/logo.svg"-->
		<!--						class="mr-3 h-8"-->
		<!--						alt="FlowBite Logo"-->
		<!--					/>-->
		<!--					<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"-->
		<!--						>Flowbite</span-->
		<!--					>-->
		<!--				</a>-->
		<!--			</div>-->
		<!--			<div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">-->
		<!--				<div>-->
		<!--					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">-->
		<!--						Resources-->
		<!--					</h2>-->
		<!--					<ul class="text-gray-600 dark:text-gray-400">-->
		<!--						<li class="mb-4">-->
		<!--							<a href="https://flowbite.com" class="hover:underline">Flowbite</a>-->
		<!--						</li>-->
		<!--						<li>-->
		<!--							<a href="https://tailwindcss.com/" class="hover:underline">Tailwind CSS</a>-->
		<!--						</li>-->
		<!--					</ul>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">-->
		<!--						Follow us-->
		<!--					</h2>-->
		<!--					<ul class="text-gray-600 dark:text-gray-400">-->
		<!--						<li class="mb-4">-->
		<!--							<a href="https://github.com/themesberg/flowbite" class="hover:underline">Github</a>-->
		<!--						</li>-->
		<!--						<li>-->
		<!--							<a href="https://discord.gg/4eeurUVvTy" class="hover:underline">Discord</a>-->
		<!--						</li>-->
		<!--					</ul>-->
		<!--				</div>-->
		<!--				<div>-->
		<!--					<h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2>-->
		<!--					<ul class="text-gray-600 dark:text-gray-400">-->
		<!--						<li class="mb-4">-->
		<!--							<a href="/" class="hover:underline">Privacy Policy</a>-->
		<!--						</li>-->
		<!--						<li>-->
		<!--							<a href="/" class="hover:underline">Terms &amp; Conditions</a>-->
		<!--						</li>-->
		<!--					</ul>-->
		<!--				</div>-->
		<!--			</div>-->
		<!--		</div>-->
		<hr class="mb-6 border-gray-200 sm:mx-auto lg:mb-8 dark:border-gray-700" />
		<div class="sm:flex sm:items-center sm:justify-between">
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400"
				>© 2025 <a href="" class="hover:underline">WebGCS</a>. All Rights Reserved.
			</span>
			<div class="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
				<a
					href="https://www.linkedin.com/company/mapture/"
					target="_blank"
					class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
					aria-label="linkedin"
				>
					<svg
						class="h-5 w-5"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							fill-rule="evenodd"
							d="M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z"
							clip-rule="evenodd"
						/>
						<path d="M7.2 8.809H4V19.5h3.2V8.809Z" />
					</svg>
				</a>
				<a
					href="https://github.com/bartslinger"
					class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
					aria-label="github"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/></svg
					>
				</a>
			</div>
		</div>
	</div>
</footer>
