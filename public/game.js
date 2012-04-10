window.game = {
	init: function (socket) {
		// Statics
		this.balls = {};
		// Canvas
		this.initCanvas();
		// Sockets
		this.socket = socket;
		this.initSockets();
	},
	initCanvas: function () {
		var that = this;
		this.canvas = document.getElementById('game');
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			// Run application
			setInterval(function() {
				that.moveBalls();
				that.drawBalls(that.ctx);
			}, 30);
		}
		else
			alert('Youd need to upgrade your browser to access at the applicatio.\nUse google chrome ;)');
	},
	initSockets: function () {
		var that = this;
		this.socket.emit('getBalls');
		this.socket.on('allBalls', function (balls) {
			that.balls = balls;
			for (var i in balls) {
				that.addBall(balls[i]);
			}
		});
		this.socket.on('newBall', function (ball) {
			that.addBall(ball);
		});
		this.socket.on('changeBall', function (ball) {
			that.balls[ball.id].color = ball.color;
		});
		this.socket.on('removeBall', function (id) {
			that.balls[id].opacity = 0.7;
			that.removeBall(id);
		});
	},
	addBall: function (ball) {
		ball.trailSize = ball.trailSize || 20;
		ball.trail = [];
		this.balls[ball.id] = ball;
	},
	removeBall: function (id) {
		var that = this;
		setTimeout(function () {
			that.balls[id].color = 'rgba(0, 0, 0, '+that.balls[id].opacity+')';
			that.balls[id].opacity -= 0.03;
			if (that.balls[id].opacity <= 0) {
				delete that.balls[id];
			}
			else {
				that.removeBall(id);
			}
		}, 30);
	},
	moveBalls: function () {
		var ball;
		for (var i in this.balls) {
			ball = this.balls[i];
			ball.trail.push({
				x: ball.x,
				y: ball.y,
				color: ball.color
			});
			if (ball.trail.length > ball.trailSize) {
				ball.trail.shift();
			}
			ball.x   =  ball.x + (ball.dirX * ball.speed);
			ball.y   =  ball.y + (ball.dirY * ball.speed);
			if (ball.x <= 0 || (ball.x + ball.size) >= this.width) {
				if ((ball.x <= 0 && ball.dirX < 0) ||
					((ball.x + ball.size) >= this.width && ball.dirX > 0)) {
					ball.dirX = -ball.dirX;
				}
				if (ball.x < 0)
					ball.x = 0;
				if ((ball.x + ball.size) > this.width)
					ball.x = this.width - ball.size;
			}
			if (ball.y <= 0 || (ball.y + ball.size) >= this.height) {
				if ((ball.y <= 0 && ball.dirY < 0) ||
					((ball.y + ball.size) >= this.height && ball.dirY > 0)) {
					ball.dirY = -ball.dirY;
				}
				if (ball.y < 0)
					ball.y = 0;
				if ((ball.y + ball.size) > this.height)
					ball.y = this.height - ball.size;
			}
		}
	},
	drawBalls: function () {
		var ball;
		this.clear();
		for (var i in this.balls) {
			ball = this.balls[i];
			this.drawTrail(ball);
			this.drawBall(ball);
		}
	},
	drawTrail: function (ball) {
		var trail = ball.trail,
			tmp = {};
		for (var i = 0, l = trail.length; i < l; i++) {
			tmp.color = trail[i].color;
			tmp.x = trail[i].x;
			tmp.y = trail[i].y;
			tmp.size = ball.size - (trail.length - i);
			if (tmp.size > 0) {
				this.drawBall(tmp);
			}
		}
	},
	drawBall: function (ball) {
		var rayon = ball.size / 2;
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = ball.color;
		this.ctx.fillStyle = ball.color;
		this.ctx.beginPath();
		this.ctx.arc((ball.x + rayon), (ball.y + rayon), rayon, 0, Math.PI*2);
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	},
	clear: function () {
    	this.ctx.fillStyle = 'rgb(50,50,50)';
    	this.ctx.fillRect(0, 0, this.width, this.height);
	}
};