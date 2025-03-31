<section
	class="mx-auto grid w-full max-w-screen-xl bg-white px-4 py-8 pt-20 lg:py-32 dark:bg-gray-900"
>
	<div class="mb-8 max-w-screen-md lg:mb-16">
		<h1 class="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
			Roadmap
		</h1>
		<p class="mb-4 font-light text-gray-500 sm:text-xl dark:text-gray-400">
			The work is divided into several work packages. There is deliberately no timeline attached, as
			this depends very much on available time.
		</p>
		<h2 class="my-8 text-4xl font-extrabold text-gray-900 dark:text-white">Vision</h2>
		<p class="mb-4 font-light text-gray-500 sm:text-xl dark:text-gray-400">
			The vision of this project is for it to become an alternative to QGroundControl and Mission
			Planner. The GCS will be designed with multi-vehicle operations in mind.
		</p>
		<h2 class="my-8 text-4xl font-extrabold text-gray-900 dark:text-white">Connectivity</h2>
		<ul class="space-y-2">
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>
						Basic simulator to simulate a fixed-wing UAV. This enables a demo mode to test
						functionality without actually connecting to a vehicle.
					</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>
						Crossfire <span class="font-semibold">CRSF</span> protocol via webserial. This enables using
						WebGCS as a visualizer for Crossfire telemetry.
					</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					Mavlink communication via webserial. This is a prerequisite for components that rely on Mavlink
					telemetry and commands.
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					Mavlink communication via raw websocket. This also requires a server-side utility to wrap raw
					mavlink packets into binary websocket format. Raw mavlink is preferred over utilities like
					mavlink2rest, to save bandwidth.
				</label>
			</li>
		</ul>
		<h2 class="my-8 text-4xl font-extrabold text-gray-900 dark:text-white">UI Components</h2>
		<ul class="space-y-2">
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" checked disabled />
					<p>Basic Mapbox integration. This will enable the use of Mapbox maps in WebGCS.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" />
					<p>Basic telemetry display. This will show basic telemetry data from the UAV.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" />
					<p>
						Multi-vehicle go-to waypoint commands. Design intuitive UI for selecting and commanding
						vehicles.
					</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" />
					<p>Flight trail display. Show the path of the vehicle on the map.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" />
					<p></p>
				</label>
			</li>
		</ul>
		<h2 class="my-8 text-4xl font-extrabold text-gray-900 dark:text-white">Project Maintenance</h2>
		<ul class="space-y-2">
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" checked disabled />
					<p>Create a basic website and publish it.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Create a more complete text for the vision.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Create the about page for the website.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Create markdown pages, including for the roadmap.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Create more items for the roadmap.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Get the documentation pages going using markdown and mdsvex.</p>
				</label>
			</li>
			<li>
				<label class="roadmap-item">
					<input type="checkbox" class="roadmap-checkbox" disabled />
					<p>Create documentation for installation instructions.</p>
				</label>
			</li>
		</ul>
	</div>
</section>
