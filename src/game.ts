type Direction = 'up' | 'down' | 'left' | 'right';

class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scoreElement: HTMLElement;
    private restartButton: HTMLButtonElement;

    // Control buttons
    private upBtn: HTMLButtonElement;
    private downBtn: HTMLButtonElement;
    private leftBtn: HTMLButtonElement;
    private rightBtn: HTMLButtonElement;

    // Game state
    private gridSize = 20;
    private snake: Array<{ x: number; y: number }> = [];
    private food: { x: number; y: number } | null = null;
    private direction: Direction = 'right';
    private nextDirection: Direction = 'right';
    private score = 0;
    private gameLoopId: number | null = null;

    // Touch controls
    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.initDOMElements();
        this.setupCanvas();
        this.bindEvents();
        this.initGame();
    }

    private initDOMElements(): void {
        const getElement = <T extends HTMLElement>(id: string): T => {
            const el = document.getElementById(id);
            if (!el) throw new Error(`Element #${id} not found`);
            return el as T;
        };

        this.canvas = getElement<HTMLCanvasElement>('gameCanvas');
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = getElement('score');
        this.restartButton = getElement<HTMLButtonElement>('restart');
        this.upBtn = getElement<HTMLButtonElement>('upBtn');
        this.downBtn = getElement<HTMLButtonElement>('downBtn');
        this.leftBtn = getElement<HTMLButtonElement>('leftBtn');
        this.rightBtn = getElement<HTMLButtonElement>('rightBtn');
    }

    private setupCanvas(): void {
        this.adjustCanvasSize();
        window.addEventListener('resize', () => this.adjustCanvasSize());
        console.assert(this.canvas.width === 400 && this.canvas.height === 400,
            "Canvas size must be 400x400");
    }

    private adjustCanvasSize(): void {
        const maxSize = Math.min(window.innerWidth - 40, 400);
        this.canvas.style.width = `${maxSize}px`;
        this.canvas.style.height = `${maxSize}px`;
    }

    private initGame(): void {
        this.snake = [{ x: 5, y: 5 }];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.generateFood();
        this.updateScore();
        this.startGameLoop();
    }

    private generateFood(): void {
        const maxPos = this.canvas.width / this.gridSize;
        let newFood: { x: number; y: number };

        do {
            newFood = {
                x: Math.floor(Math.random() * maxPos),
                y: Math.floor(Math.random() * maxPos)
            };
        } while (this.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));

        this.food = newFood;
    }

    private updateScore(): void {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    private startGameLoop(): void {
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        this.gameLoop();
    }

    private gameLoop(): void {
        this.moveSnake();
        this.checkCollision();
        this.draw();

        setTimeout(() => {
            this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
        }, 400);
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        if (this.food) {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(
                this.food.x * this.gridSize,
                this.food.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
    }

    private moveSnake(): void {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y -= 1; break;
            case 'down': head.y += 1; break;
            case 'left': head.x -= 1; break;
            case 'right': head.x += 1; break;
        }

        this.snake.unshift(head);

        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    private checkCollision(): void {
        const head = this.snake[0];
        const maxPos = this.canvas.width / this.gridSize;

        // Wall collision
        if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
            this.handleGameOver();
            return;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.handleGameOver();
                return;
            }
        }
    }

    private handleGameOver(): void {
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        this.vibrate(200);
        alert(`GAME OVER! Score: ${this.score}`);
        this.initGame();
    }

    private bindEvents(): void {
        // Keyboard controls
        let lastKeyTime = 0;
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (performance.now() - lastKeyTime < 100) return;

            const keyMap: Record<string, Direction> = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };

            if (keyMap[e.key] && this.isValidDirection(keyMap[e.key])) {
                this.nextDirection = keyMap[e.key];
                lastKeyTime = performance.now();
                e.preventDefault();
            }
        });

        // Touch controls
        this.bindControlButton(this.upBtn, 'up');
        this.bindControlButton(this.downBtn, 'down');
        this.bindControlButton(this.leftBtn, 'left');
        this.bindControlButton(this.rightBtn, 'right');

        // Swipe controls
        this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.touchStartTime = performance.now();
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e: TouchEvent) => {
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            const deltaTime = performance.now() - this.touchStartTime;

            if (deltaTime < 100 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
                const direction = Math.abs(deltaX) > Math.abs(deltaY)
                    ? (deltaX > 0 ? 'right' : 'left')
                    : (deltaY > 0 ? 'down' : 'up');

                if (this.isValidDirection(direction)) {
                    this.nextDirection = direction;
                    this.vibrate();
                    this.touchStartX = touch.clientX;
                    this.touchStartY = touch.clientY;
                }
                e.preventDefault();
            }
        }, { passive: false });

        // Restart button
        let lastClickTime = 0;
        this.restartButton.addEventListener('click', () => {
            if (performance.now() - lastClickTime < 1000) return;
            lastClickTime = performance.now();
            this.initGame();
        });
    }

    private bindControlButton(btn: HTMLButtonElement, direction: Direction): void {
        const handler = (e: Event) => {
            e.preventDefault();
            if (this.isValidDirection(direction)) {
                this.nextDirection = direction;
                this.vibrate();
            }
        };

        btn.addEventListener('pointerdown', handler);
        btn.addEventListener('touchstart', handler);
    }

    private isValidDirection(newDirection: Direction): boolean {
        const oppositeMap: Record<Direction, Direction> = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        return this.direction !== oppositeMap[newDirection];
    }

    private vibrate(duration = 50): void {
        try {
            if (navigator.vibrate) {
                navigator.vibrate(duration);
            }
        } catch (e) {
            console.warn('Vibration API not supported');
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SnakeGame();
    } catch (error) {
        console.error('Game initialization failed:', error);
        alert('Game failed to initialize. Please check console for details.');
    }
});