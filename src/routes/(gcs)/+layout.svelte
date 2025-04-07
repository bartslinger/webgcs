<script lang="ts">
	import '../../app.css';
	let { children } = $props();
</script>

<div class="h-screen w-full bg-gray-50 p-10">
	<div class="h-full overflow-hidden rounded-md shadow-lg">
		{@render children()}
	</div>
</div>
