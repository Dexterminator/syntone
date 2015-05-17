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

function initSlider() {
  var slider = $('#slider');
  slider.slider({
    orientation: "horizontal",
    range: "min",
    max: 127,
    value: 0
  });
  return slider;
}

function setSliderCallbacks(slider) {
  var socket = io();
  socket.on('slider change', function (message) {
    console.log('got slider change message: ', message);
    slider.slider('value', message);
  });

  slider.on('slide', function (event, ui) {
    console.log('slide change', ui.value);
    socket.emit('slider change', ui.value);
    Pd.send('lp1', [parseFloat(ui.value)]);
  });
}

$(function() {
  loadPdPatch();
  var slider = initSlider();
  setSliderCallbacks(slider);
});
