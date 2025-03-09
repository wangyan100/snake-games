"use strict";
class SnakeGame {
    constructor() {
        this.gridSize = 20; // 网格尺寸
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoopId = null;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.restartButton = document.getElementById('restart');
        this.init();
        this.bindEvents();
    }
    // 初始化游戏
    init() {
        this.snake = [{ x: 5, y: 5 }];
        this.generateFood();
        this.score = 0;
        this.updateScore();
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        this.gameLoop();
    }
    // 生成食物
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }
    // 更新得分显示
    updateScore() {
        this.scoreElement.textContent = `得分: ${this.score}`;
    }
    // 游戏主循环
    gameLoop() {
        this.moveSnake();
        this.checkCollision();
        this.draw();
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }
    // 绘制画面
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制蛇
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        // 绘制食物
        if (this.food) {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        }
    }
    // 移动蛇
    moveSnake() {
        this.direction = this.nextDirection;
        const head = Object.assign({}, this.snake[0]);
        switch (this.direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        this.snake.unshift(head);
        // 检查是否吃到食物
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        }
        else {
            this.snake.pop();
        }
    }
    // 碰撞检测
    checkCollision() {
        const head = this.snake[0];
        // 边界检测
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }
        // 自碰检测
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
    }
    // 游戏结束
    gameOver() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        alert(`游戏结束！得分: ${this.score}`);
        this.init();
    }
    // 绑定事件
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down')
                        this.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up')
                        this.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right')
                        this.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left')
                        this.nextDirection = 'right';
                    break;
            }
        });
        this.restartButton.addEventListener('click', () => this.init());
    }
}
// 启动游戏
new SnakeGame();
