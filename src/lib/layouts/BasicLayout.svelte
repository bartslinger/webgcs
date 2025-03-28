<script lang="ts">
	let { topbar } = $props();
</script>

<div class="flex h-full w-full flex-col overflow-hidden bg-red-300">
	<div>
		{@render topbar?.()}
	</div>

	<div class="h-full w-full bg-blue-300">this is the layout</div>
</div>
