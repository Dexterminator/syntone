var _ = require('lodash');

var connected = 0;
var rooms = ['0'];
var roomIdCounter = 0;
var SOCKETS_PER_ROOM = 3;

module.exports.init = function(io) {
  io.on('connection', function(socket){
    connected++;
    console.log('user connected. ' + connected + ' users now connected.');
    assignRoom(io, socket);
    setCallbacks(socket);
  });
};

function setCallbacks (socket) {
  socket.on('disconnect', function () {
    connected--;
    console.log('user disconnected')
  });

  socket.on('test message', function (message) {
    onTestMessage(socket, message);
  });

  socket.on('slider change', function (message) {
    onSliderChange(socket, message);
  });
}

function assignRoom (io, socket) {
  var room = _.find(rooms, function (room) {
    return roomSockets(io, room).length < SOCKETS_PER_ROOM;
  });

  if (!room) {
    roomIdCounter++;
    room = roomIdCounter.toString();
    rooms.push(room);
    console.log('Rooms full, create room ' + room);
  }

  console.log('Joining room ' + room);
  socket.room = room;
  socket.join(room);
}

function roomSockets(io, roomId) {
  var clients = io.sockets.adapter.rooms[roomId];
  var sockets = [];
  for (var clientId in clients) {
    sockets.push(io.sockets.connected[clientId]);
  }
  return sockets;
}

function onTestMessage(socket, message) {
  console.log('test message from socket ' + socket.id + ' in room ' + socket.room + ': ' + message);
  socket.emit('test message', 'I am a socket.io message from the server!');
}

function onSliderChange (socket, message) {
  socket.to(socket.room).emit('slider change', message);
}
