$(function() {
  $('#jquery-test').append('I was appended by jQuery!');
  var lodashTest = $('#lodash-test');
  lodashTest.append('Calculated by lodash: ');
  _.map([1, 2, 3], function(n) {lodashTest.append((n * 3) + ' ')});


  var patch;
  $.get('pd/Syntone.pd', function(example) {
    $.get('pd/SyntoneLead.pd', function(syntone) {
      // Loading the patch and abstraction
      Pd.registerAbstraction('SyntoneLead', syntone);
      patch = Pd.loadPatch(example);
      $('#pd-starter').click(function(event) {
        Pd.start();
      });
      $('#pd-stopper').click(function(event) {
        Pd.stop();
      });
    });
  });

  var slider = $('#slider');
  slider.slider({
    orientation: "horizontal",
    range: "min",
    max: 127,
    value: 0,
  });

  var socket = io();
  socket.emit('test message', 'testing, testing');
  socket.on('test message', function (message) {
    $('#io-message').append(message);
  });
  socket.on('slider change', function (message) {
    console.log('got slider change message: ', message);
    slider.slider('value', message);
  });

  slider.on('slide', function (event, ui) {
    console.log('slide change', ui.value);
    socket.emit('slider change', ui.value);
    Pd.send('lp1', [parseFloat(ui.value)]);
  });
});
