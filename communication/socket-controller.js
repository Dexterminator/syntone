var _ = require('lodash');
var socketCallbacks = require('./socket-callbacks');

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

function initRoomState(room) {
  var roomState = {
    lead: {},
    bass: {},
    drums: {}
  };

  _.forEach(leadParams, function (param) {
    roomState.lead[param] = 0;
  });
  _.forEach(bassParams, function (param) {
    roomState.bass[param] = 0;
  });
  _.forEach(drumsParams, function (param) {
    roomState.drums[param] = 0;
  });
  roomStates[room] = roomState;
  return roomState;
}

module.exports.init = function(io) {
  io.on('connection', function(socket){
    connected++;
    console.log('User connected. ' + connected + ' users now connected.');
    var room = assignRoom(io, socket);
    var roomState = roomStates[room] || initRoomState(room);
    console.log(roomStates[room]);
    socketCallbacks.setParameterCallbacks(socket, roomState, 'lead', leadParams);
    socketCallbacks.setParameterCallbacks(socket, roomState, 'bass', bassParams);
    socketCallbacks.setParameterCallbacks(socket, roomState, 'drums', drumsParams);
  });
};

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
