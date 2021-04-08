interface SnakeOptions {
	width?: number;
	height?: number;
	startingSize?: number;
	maxFood?: number;
}

enum GameState {
	Playing = 'PLAYING',
	Lost = 'LOST'
}

type Cell = 'EMPTY' | 'SNAKE' | 'FOOD';
type Point = [number, number];

const outOfBounds = ([x, y]: Point, width: number, height: number) => {
	return x < 0 || x >= width || y < 0 || y >= height;
};

const randomPoint = ([mx, my]: Point, [dx, dy]: Point = [0, 0]): Point => [
	Math.floor(dx + Math.random() * Math.floor(mx - 2 * dx)),
	Math.floor(dy + Math.random() * Math.floor(my - 2 * dy))
];

class Snake {
	state: GameState = GameState.Playing;
	private width: number;
	private height: number;
	private maxFood: number;
	startingSize: number;
	timeSinceFood = 0;

	direction: [number, number] = [0, 0];
	snake: Array<Point> = [];
	food: Array<Point> = [];
	private grid: Cell[][];

	constructor(options: SnakeOptions) {
		const currentOptions = {
			width: 25,
			height: 25,
			startingSize: 2,
			maxFood: 1,
			...options
		};

		this.width = currentOptions.width;
		this.height = currentOptions.height;
		this.maxFood = currentOptions.maxFood;
		this.startingSize = currentOptions.startingSize;
		this.grid = [...Array(this.width)].map(() => [...Array(this.height)].map(() => 'EMPTY'));

		this.reset();
	}

	reset = (): void => {
		const [x, y] = randomPoint([this.width, this.height], [3, 3]);

		const d = [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1]
			],
			i = Math.floor(Math.random() * d.length);
		const dx = d[i][0],
			dy = d[i][1];

		this.snake = [
			[x, y],
			[x + dx, y + dy]
		];

		this.direction = [0, 0];
		this.state = GameState.Playing;
		this.food = [];

		for (let i = 0; i < this.maxFood; i++) this.placeFood();
		this.updateGrid();
	};

	update = ([dx, dy]: Point): Cell[][] => {
		if (this.state === GameState.Playing) {
			this.step([dx, dy]);
			this.updateGrid();
		}
		return this.grid;
	};

	private step = (newDirection: Point) => {
		const [hx, hy] = this.snake[0];
		if (newDirection[0] !== -this.direction[0] || newDirection[1] !== -this.direction[1])
			this.direction = newDirection;

		const [dx, dy] = this.direction;

		if (dx !== dy) {
			this.direction = [dx, dy];
			const newHead: Point = [dx + hx, hy + dy];
			if (outOfBounds(newHead, this.width, this.height)) {
				this.state = GameState.Lost;
				return;
			}

			const ateFood = this.food.some(([x, y], i) => {
				const eaten = x === newHead[0] && y === newHead[1];
				if (eaten) this.food.splice(i, 1);

				return eaten;
			});

			const body = this.snake.slice(0, this.snake.length - (ateFood ? 0 : 1));

			if (body.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
				this.state = GameState.Lost;
				return;
			}

			this.snake = [newHead, ...body];
			if (ateFood) {
				this.placeFood();
			} else {
				this.timeSinceFood++;
			}
		}
	};

	private updateGrid = () => {
		for (let i = 0; i < this.grid.length; i++) {
			for (let k = 0; k < this.grid.length; k++) {
				this.grid[i][k] = 'EMPTY';
			}
		}
		this.snake.forEach(([x, y]) => {
			this.grid[x][y] = 'SNAKE';
		});
		this.food.forEach(([x, y]) => {
			this.grid[x][y] = 'FOOD';
		});
	};

	private placeFood = () => {
		let [x, y] = randomPoint([this.width, this.height]);
		while (this.snake.some(([sx, sy]) => sx === x && sy === y)) {
			[x, y] = randomPoint([this.width, this.height]);
		}
		this.food.push([x, y]);
	};
}

export { Snake, GameState };
export type { SnakeOptions, Point, Cell };
