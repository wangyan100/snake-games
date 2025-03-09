var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var SnakeGame = /** @class */ (function () {
    function SnakeGame() {
        this.gridSize = 20; // 网格尺寸
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoopId = null;
        // 初始化元素
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.restartButton = document.getElementById('restart');
        // 关键修复：确保画布尺寸正确初始化
        console.assert(this.canvas.width === 400 && this.canvas.height === 400, "Canvas尺寸必须为400x400");
        this.init();
        this.bindEvents();
    }
    SnakeGame.prototype.init = function () {
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
    };
    SnakeGame.prototype.generateFood = function () {
        // 生成食物（确保不与蛇身重叠）
        var maxPos = this.canvas.width / this.gridSize;
        var newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * maxPos),
                y: Math.floor(Math.random() * maxPos)
            };
        } while (this.snake.some(function (seg) { return seg.x === newFood.x && seg.y === newFood.y; }));
        this.food = newFood;
    };
    SnakeGame.prototype.updateScore = function () {
        this.scoreElement.textContent = "Punkte: ".concat(this.score);
    };
    SnakeGame.prototype.gameLoop = function () {
        var _this = this;
        this.moveSnake();
        this.checkCollision();
        this.draw();
        setTimeout(function () {
            _this.gameLoopId = requestAnimationFrame(function () { return _this.gameLoop(); });
        }, 400); // 原为无延迟
    };
    SnakeGame.prototype.draw = function () {
        var _this = this;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制蛇
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(function (segment) {
            _this.ctx.fillRect(segment.x * _this.gridSize, segment.y * _this.gridSize, _this.gridSize - 2, _this.gridSize - 2);
        });
        // 绘制食物
        if (this.food) {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        }
    };
    SnakeGame.prototype.moveSnake = function () {
        this.direction = this.nextDirection;
        var head = __assign({}, this.snake[0]);
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
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        }
        else {
            this.snake.pop();
        }
    };
    SnakeGame.prototype.checkCollision = function () {
        var head = this.snake[0];
        var maxPos = this.canvas.width / this.gridSize;
        // 边界检测
        if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
            this.gameOver();
            return;
        }
        // 自碰检测（跳过头部）
        for (var i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
    };
    SnakeGame.prototype.gameOver = function () {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        alert("GAME OVER\uFF01PUNKTE: ".concat(this.score));
        this.init();
    };
    SnakeGame.prototype.bindEvents = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'ArrowUp':
                    if (_this.direction !== 'down')
                        _this.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    if (_this.direction !== 'up')
                        _this.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    if (_this.direction !== 'right')
                        _this.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    if (_this.direction !== 'left')
                        _this.nextDirection = 'right';
                    break;
            }
        });
        this.restartButton.addEventListener('click', function () { return _this.init(); });
    };
    return SnakeGame;
}());
// 启动游戏
new SnakeGame();
