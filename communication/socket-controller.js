var _ = require('lodash');

var connected = 0;
var rooms = ['0'];
var roomIdCounter = 0;
var SOCKETS_PER_ROOM = 3;
var leadParams = [
  'lp1', 'lp2', 'lp3', 'lp4',
  'lp5', 'lp6', 'lp7', 'lp8'
];
var bassParams = [
  'bp1', 'bp2', 'bp3', 'bp4',
  'bp5', 'bp6', 'bp7', 'bp8'
];
var drumsParams = [
  'dp1', 'dp2', 'dp3', 'dp4',
  'dp5', 'dp6', 'dp7', 'dp8'
];
var roomStates = [];

module.exports.init = function(io) {
  io.on('connection', function(socket) {
    connected++;
    console.log('User connected. ' + connected + ' users now connected.');
    var room = assignRoom(io, socket);
    var roomState = roomStates[room] || initRoomState(room);
    syncRoomParams(room, socket);
    setParameterCallbacks(socket, roomState, 'bass', bassParams);
    setParameterCallbacks(socket, roomState, 'lead', leadParams);
    setParameterCallbacks(socket, roomState, 'drums', drumsParams);
    setKeyboardCallbacks(socket);
    setRoomConnectionEvents(io, room, socket);
  });
};

function setKeyboardCallbacks(socket) {
  socket.on('keyEvent', function (keyInfo) {
    socket.to(socket.room).emit('keyEvent', keyInfo);
  });
}

function setParameterCallbacks (socket, roomState, instrument, paramList) {
  _.forEach(paramList, function (param) {
    socket.on(param, function (message) {
      var value = parseInt(message);
      var lastValue = roomState[instrument][param];
      roomState[instrument][param] = value;
      socket.to(socket.room).emit(param, message);
      console.log('Room ' + socket.room + ': ' + param + ': ' + lastValue + ' -> ' + value);
    });
  });
}

function setRoomConnectionEvents(io, room, socket) {
  socket.name = socket.id;
  _.forEach(roomSockets(io, room), function (roomSocket) {
    socket.emit('joined', roomSocket.name);
  });
  socket.to(socket.room).emit('joined', socket.name);
  socket.on('disconnect', function () {
    io.sockets.to(room).emit('left', socket.name);
  });
  socket.on('name-changed', function (name) {
    socket.name = name;
    io.sockets.to(socket.room).emit('name-changed', {id: socket.id, name: name});
    socket.emit('name-changed', {id: socket.id, name: name});
  });
}

function syncRoomParams(room, socket) {
  _.forIn(roomStates[room], function (obj) {
    _.forIn(obj, function (value, param) {
      socket.emit(param, value);
    })
  });
}

function initRoomState(room) {
  var roomState = {
    lead: {},
    bass: {},
    drums: {}
  };

  _.forEach(leadParams, function (param) {
    roomState.lead[param] = 0;
  });

  roomState.lead.lp1 = 50;
  roomState.lead.lp2 = 0;
  roomState.lead.lp3 = 50;

  _.forEach(bassParams, function (param) {
    roomState.bass[param] = 0;
  });

  _.forEach(drumsParams, function (param) {
    roomState.drums[param] = 0;
  });

  roomStates[room] = roomState;
  return roomState;
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
  return room;
}

function roomSockets(io, roomId) {
  var clients = io.sockets.adapter.rooms[roomId];
  var sockets = [];
  for (var clientId in clients) {
    sockets.push(io.sockets.connected[clientId]);
  }

  return sockets;
}
