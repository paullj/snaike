<script lang="ts">
	import { Snake } from '$lib/_snakeGame';
	import type { Point, Cell } from '$lib/_snakeGame';
	import { onMount } from 'svelte';

	const SIZE = 11;
	let direction: Point = [0, 0]
	let state: string;
	let score = 0;
	let grid: Cell[][];
	const game = new Snake({
		width: SIZE, height: SIZE
	});
	onMount(()=> {
		tick();
	});

	const tick = () => {
		setTimeout(() => {
			grid = game.update(direction);
			state = game.state;
			score = game.snake.length - game.startingSize;
			tick();
		}, 300);
	}

	const onKeyDown = (event) => {
		switch (event.key) {
			case 'ArrowLeft':
			case 'a':
				direction = [-1, 0];
				break;
			case 'ArrowRight':
			case 'd':
				direction = [1, 0];
				break;
			case 'ArrowUp':
			case 'w':
				direction = [0, -1];
				break;
			case 'ArrowDown':
			case 's':
				direction = [0, 1];
				break;
			case 'Enter':
				direction = [0, 0]
				game.reset();
				break;
    	}
	};
	
</script>

<svelte:window on:keydown={onKeyDown}/>


<div>
	<div>
		State: { state }, Score: {score}
	</div>
	<div class="inline-block p-px border-2">
		{#if grid} 
		<div class="space-y-px">
			{#each Array(SIZE) as _, y}
				<div class="flex flex-row space-x-px ">
					{#each Array(SIZE) as _, x}
						<div class="w-4 h-4 "
						class:bg-red-500={grid[x][y] === "FOOD"}
						class:bg-blue-500={grid[x][y] === "SNAKE"}>	
						</div>
					{/each}
				</div>
			{/each}
		</div>
		{/if}
</div>
</div>