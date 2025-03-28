<script lang="ts">
	let { children } = $props();
</script>

<div class="m-10 h-[300px] w-[800px]">
	{@render children()}
</div>
