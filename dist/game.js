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
        // Game state
        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoopId = null;
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.initialize();
    }
    SnakeGame.prototype.initialize = function () {
        this.initDOMElements();
        this.setupCanvas();
        this.bindEvents();
        this.initGame();
    };
    SnakeGame.prototype.initDOMElements = function () {
        var getElement = function (id) {
            var el = document.getElementById(id);
            if (!el)
                throw new Error("Element #".concat(id, " not found"));
            return el;
        };
        this.canvas = getElement('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = getElement('score');
        this.restartButton = getElement('restart');
        this.upBtn = getElement('upBtn');
        this.downBtn = getElement('downBtn');
        this.leftBtn = getElement('leftBtn');
        this.rightBtn = getElement('rightBtn');
    };
    SnakeGame.prototype.setupCanvas = function () {
        var _this = this;
        this.adjustCanvasSize();
        window.addEventListener('resize', function () { return _this.adjustCanvasSize(); });
        console.assert(this.canvas.width === 400 && this.canvas.height === 400, "Canvas size must be 400x400");
    };
    SnakeGame.prototype.adjustCanvasSize = function () {
        var maxSize = Math.min(window.innerWidth - 40, 400);
        this.canvas.style.width = "".concat(maxSize, "px");
        this.canvas.style.height = "".concat(maxSize, "px");
    };
    SnakeGame.prototype.initGame = function () {
        this.snake = [{ x: 5, y: 5 }];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.generateFood();
        this.updateScore();
        this.startGameLoop();
    };
    SnakeGame.prototype.generateFood = function () {
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
        this.scoreElement.textContent = "Score: ".concat(this.score);
    };
    SnakeGame.prototype.startGameLoop = function () {
        if (this.gameLoopId)
            cancelAnimationFrame(this.gameLoopId);
        this.gameLoop();
    };
    SnakeGame.prototype.gameLoop = function () {
        var _this = this;
        this.moveSnake();
        this.checkCollision();
        this.draw();
        setTimeout(function () {
            _this.gameLoopId = requestAnimationFrame(function () { return _this.gameLoop(); });
        }, 400);
    };
    SnakeGame.prototype.draw = function () {
        var _this = this;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw snake
        this.ctx.fillStyle = '#2ecc71';
        this.snake.forEach(function (segment) {
            _this.ctx.fillRect(segment.x * _this.gridSize, segment.y * _this.gridSize, _this.gridSize - 2, _this.gridSize - 2);
        });
        // Draw food
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
        // Wall collision
        if (head.x < 0 || head.x >= maxPos || head.y < 0 || head.y >= maxPos) {
            this.handleGameOver();
            return;
        }
        // Self collision
        for (var i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.handleGameOver();
                return;
            }
        }
    };
    SnakeGame.prototype.handleGameOver = function () {
        if (this.gameLoopId)
            cancelAnimationFrame(this.gameLoopId);
        this.vibrate(200);
        alert("GAME OVER! Score: ".concat(this.score));
        this.initGame();
    };
    SnakeGame.prototype.bindEvents = function () {
        var _this = this;
        // Keyboard controls
        var lastKeyTime = 0;
        document.addEventListener('keydown', function (e) {
            if (performance.now() - lastKeyTime < 100)
                return;
            var keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            if (keyMap[e.key] && _this.isValidDirection(keyMap[e.key])) {
                _this.nextDirection = keyMap[e.key];
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
        this.canvas.addEventListener('touchstart', function (e) {
            var touch = e.touches[0];
            _this.touchStartX = touch.clientX;
            _this.touchStartY = touch.clientY;
            _this.touchStartTime = performance.now();
            e.preventDefault();
        }, { passive: false });
        this.canvas.addEventListener('touchmove', function (e) {
            var touch = e.touches[0];
            var deltaX = touch.clientX - _this.touchStartX;
            var deltaY = touch.clientY - _this.touchStartY;
            var deltaTime = performance.now() - _this.touchStartTime;
            if (deltaTime < 100 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
                var direction = Math.abs(deltaX) > Math.abs(deltaY)
                    ? (deltaX > 0 ? 'right' : 'left')
                    : (deltaY > 0 ? 'down' : 'up');
                if (_this.isValidDirection(direction)) {
                    _this.nextDirection = direction;
                    _this.vibrate();
                    _this.touchStartX = touch.clientX;
                    _this.touchStartY = touch.clientY;
                }
                e.preventDefault();
            }
        }, { passive: false });
        // Restart button
        var lastClickTime = 0;
        this.restartButton.addEventListener('click', function () {
            if (performance.now() - lastClickTime < 1000)
                return;
            lastClickTime = performance.now();
            _this.initGame();
        });
    };
    SnakeGame.prototype.bindControlButton = function (btn, direction) {
        var _this = this;
        var handler = function (e) {
            e.preventDefault();
            if (_this.isValidDirection(direction)) {
                _this.nextDirection = direction;
                _this.vibrate();
            }
        };
        btn.addEventListener('pointerdown', handler);
        btn.addEventListener('touchstart', handler);
    };
    SnakeGame.prototype.isValidDirection = function (newDirection) {
        var oppositeMap = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        return this.direction !== oppositeMap[newDirection];
    };
    SnakeGame.prototype.vibrate = function (duration) {
        if (duration === void 0) { duration = 50; }
        try {
            if (navigator.vibrate) {
                navigator.vibrate(duration);
            }
        }
        catch (e) {
            console.warn('Vibration API not supported');
        }
    };
    return SnakeGame;
}());
// Initialize game
document.addEventListener('DOMContentLoaded', function () {
    try {
        new SnakeGame();
    }
    catch (error) {
        console.error('Game initialization failed:', error);
        alert('Game failed to initialize. Please check console for details.');
    }
});
