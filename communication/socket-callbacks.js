var _ = require('lodash');

module.exports.setParameterCallbacks = function(socket, roomState, instrument, paramList) {
  _.forEach(paramList, function (param) {
    socket.on(param, function (message) {
      var value = parseInt(message);
      var lastValue = roomState[instrument][param];
      roomState[instrument][param] = value;
      socket.to(socket.room).emit(param, message);
      console.log('--Event in room ' + socket.room + ':\n' +
      'Param ' + param + ' changed from: ' + lastValue + ' to '  + value + '--');
    });
  });
};
