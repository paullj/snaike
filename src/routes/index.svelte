<script lang="ts">
	import { onMount } from 'svelte';
	import { GameState, Snake } from '$lib/_snakeGame';
	import type { Point, Cell } from '$lib/_snakeGame';
	import type { FitnessFunction, Organism as OOrganism } from "$lib/neat";
	import { Population, Node, NodeType, Connection } from "$lib/neat";
	import Organism  from '$lib/components/Organism.svelte';
  	
	let population: Population;
	let games: Snake[];
	
	const TICK_TIME = 1;
	const SIZE = 10;
	let representative: OOrganism;
	let grid: Cell[][];
	let gamesInPlay = 0;
	
	const possibleDirections: Array<[number, number]> = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
	]

	onMount(()=> {
		const initialNodes = [
			new Node(NodeType.Input, "curr_dir"),
			new Node(NodeType.Input, "food_dist"),
			new Node(NodeType.Input, "food_angle"),
			new Node(NodeType.Input, "length"),
			new Node(NodeType.Output, "left"),
			new Node(NodeType.Output, "right"),
			new Node(NodeType.Output, "up"),
			new Node(NodeType.Output, "down"),
		];
   		 const initialConnections = [
			// new Connection(initialNodes[0], initialNodes[4]),
			// new Connection(initialNodes[1], initialNodes[4]),
			// new Connection(initialNodes[2], initialNodes[4]),
			// new Connection(initialNodes[3], initialNodes[4]),
		];
		population = new Population(
			initialNodes,
			initialConnections, {
				populationSize: 1000
			}
		);
		games = Array.from({length: population.organisms.length}).map(() => new Snake({
			width: SIZE, height: SIZE
		}));
		console.log('Starting with', population.organisms.length, 'in population')
		tick();
	});

	const tick = () => {
		setTimeout(() => {
			gamesInPlay = population.organisms.length;

			population.organisms.forEach((o, i) => {
				const game = games[i];

				if(game.state === GameState.Lost || game.timeSinceFood >= 20) {
					o.fitness = game.snake.length - game.timeSinceFood / 20;
					gamesInPlay -= 1;
					return;
				}

				const [fx, fy] = game.food[0];
				const [hx, hy] = game.snake[0];
				
				const currentDistance = possibleDirections.indexOf(game.direction);
				const distanceToFood = Math.sqrt((fx - hx) ** 2 + (fy - hy) ** 2);
				const angleToFood = Math.atan2(fy - hy, fx - hx);

				const output = o.activate([currentDistance, distanceToFood, angleToFood, game.snake.length]);
				const newDirectionIndex  = output.indexOf(Math.max(...output))

				const direction = possibleDirections[newDirectionIndex];
				const g = game.update(direction);
				if(representative && o.id === representative.id)
					grid = g;
			})

			if(gamesInPlay <= 0) {
				population.epoch();
				console.log(`Generation ${population.generation}. Population: ${population.organisms.length}/${population.config.populationSize}, Species: ${population.species.length}. Best: ${population.best.fitness.toFixed(2)}`);
				representative = population.best;
				games = Array.from({length: population.organisms.length}).map(() => new Snake({
					width: SIZE, height: SIZE
				}));
			}
			tick();
		}, TICK_TIME);
	}
	
</script>

<div>
	{gamesInPlay} games in play
</div>
<div class="flex">
<div class="inline-block p-px ">
		{#if grid} 
		<div class="space-y-px bg-red-50">
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
{#if representative}
<Organism organism={representative}></Organism>
{/if}
</div>