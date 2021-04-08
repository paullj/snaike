<script lang="ts">
	import Snake from '$lib/components/SnakeGame.svelte';

</script>

<div class="grid grid-cols-4">
	{#each Array(16) as _, i}
	<Snake></Snake>
	{/each}
</div>
