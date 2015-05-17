function loadPdPatch() {
  var patch;
  $.get('pd/Syntone.pd', function (example) {
    $.get('pd/SyntoneLead.pd', function (syntone) {
      // Loading the patch and abstraction
      Pd.registerAbstraction('SyntoneLead', syntone);
      patch = Pd.loadPatch(example);
      $('#pd-starter').click(function (event) {
        Pd.start();
      });
      $('#pd-stopper').click(function (event) {
        Pd.stop();
      });
    });
  });
}

function initSlider(param) {
  var slider = $('#' + param);
  slider.slider({
    orientation: "horizontal",
    range: "min",
    max: 127,
    value: 0
  });
  return slider;
}

function setSliderCallbacks(slider, param) {
  var socket = io();
  socket.on(param, function (message) {
    console.log('got slider change message: ', message);
    slider.slider('value', message);
  });

  slider.on('slide', function (event, ui) {
    console.log(param + ': ' + ui.value);
    socket.emit(param, ui.value);
    Pd.send(param, [parseFloat(ui.value)]);
  });
}

$(function() {
  var params = ['lp1', 'lp2', 'bp1', 'bp2'];
  loadPdPatch();
  _.forEach(params, function (param) {
    var slider = initSlider(param);
    setSliderCallbacks(slider, param);
  });
});
