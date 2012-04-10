var express = require('express'),
	io = require('socket.io'),
	app = express.createServer();

app.configure(function () {
	app.use(express.static(__dirname + '/public'));
});

app.listen(8080);

// For GAME
var balls = {};

var rand = function (min, max) {
	return Math.round(Math.random() * (max - min) + min);
};
var randomRGB = function (r_min, g_min, b_min) {
	r_min = r_min || 100;
	g_min = g_min || 100;
	b_min = b_min || 100;
	var r = rand(r_min, 255);
	var g = rand(g_min, 255);
	var b = rand(b_min, 255);
	return 'rgb('+r+', '+g+', '+b+')';
}
var generateBall = function () {
	var id = +new Date;
	var ball = {
		id: id,
		x: rand(40, 1400),
		y: rand(40, 800),
		dirX: (id % 2 ? 1 : -1),
		dirY: (id % 3 ? 1 : -1),
		size: rand(15, 35),
		speed: rand(5, 20),
		trailSize: rand(10, 45),
		color: randomRGB(),
	};
	balls[id] = ball;
	return ball;
};

// Socket.io
io = io.listen(app);

io.sockets.on('connection', function (socket) {
	socket.on('getBalls', function () {
		socket.emit('allBalls', balls);
	});
	socket.on('createBall', function () {
		var ball = generateBall();
		socket.idBall = ball.id;
		socket.emit('ownBall', ball);
		socket.broadcast.emit('newBall', ball);
	});
	socket.on('changeBallColor', function (id, color) {
		balls[id].color = color;
		socket.broadcast.emit('changeBall', balls[id]);
	});
	socket.on('disconnect', function () {
		if (socket.idBall) {
			delete balls[socket.idBall];
			socket.broadcast.emit('removeBall', socket.idBall);
		}
	});
});