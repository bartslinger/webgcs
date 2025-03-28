<script lang="ts">
	import { BasicLayout, Indicator } from '$lib';
</script>

<BasicLayout>
	{#snippet topbar()}
		this goes in the top bar
		<Indicator value={42} />
		<Indicator value={43} />
	{/snippet}
</BasicLayout>
