<script lang="ts">
	import { onMount } from "svelte";
	import type { Tweened } from 'svelte/motion';
	import { tweened } from 'svelte/motion';
    import { linear } from "svelte/easing";

	const TICK_TIME = 150;
	const GRID_SIZE = 11;
	enum State {
		PLAYING,
		LOST
	}
	
	let cellWidth;
	let canvasWidth, canvasHeight;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let state: State = State.PLAYING;
	let direction = [];
	let snake: Array<[number, number]>= [];
	let food: Array<[number, number]> = [];
	
	let displaySnake: Tweened<Array<[number, number]>>;

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
				reset();
				break;
    	}
	};

	const outOfBounds = (values: number[]) => {
		return values.some(n => (n < 0 || n >= GRID_SIZE))
	}

	const placeFood = () => {
		let x = Math.floor(Math.random() * Math.floor(GRID_SIZE));
		let y = Math.floor(Math.random() * Math.floor(GRID_SIZE));
		while(snake.some(([sx, sy]) => sx === x && sy === y)) {
			x = Math.floor(Math.random() * Math.floor(GRID_SIZE));
			y = Math.floor(Math.random() * Math.floor(GRID_SIZE));
		}
		food = [...food, [x, y]];
	}

	const tick = () => {
		setTimeout(() => {
			if(displaySnake || $displaySnake.length !== snake.length) {
                displaySnake = tweened(snake, {
                    duration: TICK_TIME, easing: linear
                });
			}

			const [hx, hy] = snake[0];
			const [dx, dy] = direction;
			if(dx !== dy) {
				const newHead: [number, number] = [dx + hx, hy + dy];
				if(outOfBounds(newHead)) {
					state = State.LOST;
					return;
				}

				const ateFood = food.some(([x, y], i) => {
					const eaten = x === newHead[0] && y === newHead[1];
					if(eaten)
						food.splice(i, 1);

					return eaten;
				})

				const body = snake.slice(0, snake.length - (ateFood ? 0 : 1));
				
				if (body.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
					state = State.LOST;
					return;
				}

				snake = [newHead, ...body];
				if(ateFood) {
					placeFood();
				}
				displaySnake.set(snake.slice(0, $displaySnake.length))
			}

			tick();
		}, TICK_TIME);
	}

	const animate = () => {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight)

		let radius = 0.85 * cellWidth / 2;
		
		food.forEach(([x, y]) => {
			ctx.fillStyle = "blue";
			ctx.beginPath();
			ctx.arc(x * cellWidth + cellWidth / 2, y * cellWidth + cellWidth / 2, radius, 0, Math.PI*2);
			ctx.closePath();
			ctx.fill();
		});

        if(displaySnake) {
            for (var i = $displaySnake.length - 1; i >= 0; --i) {
                const [cx, cy] = $displaySnake[i];

                ctx.fillStyle = i === 0 ? "yellow" : "red";
                ctx.beginPath();
                ctx.arc(cx * cellWidth + cellWidth / 2, cy * cellWidth + cellWidth / 2, radius,0,Math.PI*2);
                ctx.closePath();
                ctx.fill();
    
                if(i === 0)
                    continue;

                const [px, py] = $displaySnake[i - 1];

                ctx.lineWidth = radius * 2;
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.moveTo(cx * cellWidth + cellWidth / 2, cy * cellWidth + cellWidth / 2);
                ctx.lineTo(px * cellWidth + cellWidth / 2, py * cellWidth + cellWidth / 2);
                ctx.closePath();
                ctx.stroke();	
            };
        }

  		requestAnimationFrame(animate);
	};

	const reset = () => {
		const x = Math.floor(3 + Math.random() * Math.floor(GRID_SIZE - 6)),
			  y = Math.floor(3 + Math.random() * Math.floor(GRID_SIZE - 6)),
			  d = [[-1, 0], [1, 0], [0, -1], [0, 1]],
			  i = Math.floor(Math.random()* d.length);
		const dx = d[i][0],
			  dy = d[i][1];
		
		snake = [[x, y], [x+dx, y+dy]];
        displaySnake = tweened(snake, {
            duration: TICK_TIME, easing: linear
        });
        
		direction = [0, 0];
		state = State.PLAYING;
		
		food = [];
		placeFood();
		placeFood();

		tick();
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		reset();
		animate();
	});
</script>

<svelte:window on:keydown={onKeyDown}/>

<div>
    <div>
        {#if state === State.LOST}
            Game Over!
            <button on:click={()=> reset()}>Restart</button>
        {/if}
    </div>

    <div class="relative max-w-xl">
        <canvas bind:this={canvas} class="absolute inset-0 z-10" width={canvasWidth} height={canvasHeight}></canvas>

        <div class="grid grid-cols-11" bind:clientWidth={canvasWidth} bind:clientHeight={canvasHeight}>
            {#each Array(11*11) as _, i}
                <div bind:clientWidth={cellWidth} class="bg-gray-800 aspect-w-1 aspect-h-1" class:bg-gray-600={i % 2}></div>
            {/each}
        </div>
    </div>
</div>
