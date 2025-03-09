type Direction = 'up' | 'down' | 'left' | 'right';

class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scoreElement: HTMLElement;
    private restartButton: HTMLButtonElement;

    private gridSize = 20; // 网格尺寸
    private snake: Array<{ x: number; y: number }> = [];
    private food: { x: number; y: number } | null = null;
    private direction: Direction = 'right';
    private nextDirection: Direction = 'right';
    private score = 0;
    private gameLoopId: number | null = null;

    constructor() {
        // 初始化元素
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        this.restartButton = document.getElementById('restart') as HTMLButtonElement;

        // 关键修复：确保画布尺寸正确初始化
        console.assert(this.canvas.width === 400 && this.canvas.height === 400,
            "Canvas尺寸必须为400x400");

        this.init();
        this.bindEvents();
    }

    private init(): void {
        // 初始化蛇的位置（确保在网格范围内）
        this.snake = [{ x: 5, y: 5 }]; // 合法坐标范围：0 ≤ x,y ≤ 19 (400/20-1)
        this.generateFood();
        this.score = 0;
        this.updateScore();

        // 清除旧游戏循环
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }

        // 启动新循环
        this.gameLoop();
    }

    private generateFood(): void {
        // 生成食物（确保不与蛇身重叠）
        const maxPos = this.canvas.width / this.gridSize;
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * maxPos),
                y: Math.floor(Math.random() * maxPos)
            };
        } while (this.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));

        this.food = newFood;
    }

    private updateScore(): void {
        this.scoreElement.textContent = `Punkte: ${this.score}`;
    }

    private gameLoop(): void {
        this.moveSnake();
        this.checkCollision();
        this.draw();
        setTimeout(() => {
            this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
        }, 400); // 原为无延迟
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // 绘制食物
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

        // 边界检测
        if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
            this.gameOver();
            return;
        }

        // 自碰检测（跳过头部）
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
    }

    private gameOver(): void {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        alert(`GAME OVER！PUNKTE: ${this.score}`);
        this.init();
    }

    private bindEvents(): void {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp': if (this.direction !== 'down') this.nextDirection = 'up'; break;
                case 'ArrowDown': if (this.direction !== 'up') this.nextDirection = 'down'; break;
                case 'ArrowLeft': if (this.direction !== 'right') this.nextDirection = 'left'; break;
                case 'ArrowRight': if (this.direction !== 'left') this.nextDirection = 'right'; break;
            }
        });

        this.restartButton.addEventListener('click', () => this.init());
    }
}

// 启动游戏
new SnakeGame();