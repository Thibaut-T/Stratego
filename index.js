const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/front'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/html/index.html')
});

io.on('connection', (socket) => {
	console.log('a user connected');
});

http.listen(4200, () => {
	console.log('Serveur lancé sur le port 4200');
});