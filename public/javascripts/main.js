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

function setSliderCallbacks(slider, param, socket) {
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

function setConnectionEvents(socket, bandMemberColors) {
  var bandMembers = $('#band-members');
  socket.on('joined', function (message) {
    var colorIndex = _.random(0, bandMemberColors.length - 1);
    var color = bandMemberColors[colorIndex];
    bandMemberColors.splice(colorIndex, 1);
    var bandMember = $('<li/>')
      .append(message)
      .css('color', color)
      .hide();
    bandMembers.append(bandMember);
    bandMember.slideDown('slow');
  });

  socket.on('left', function (message) {
    var memberElems = bandMembers.find('li');
    var left = $(_.find(memberElems, function (memberElem) {
      return $(memberElem).html() === message;
    }));

    bandMemberColors.push(left.css('color'));
    left.slideUp('slow', function () {
      left.remove();
    });
  });
}

$(function() {
  var bandMemberColors = ['#00A0B0', '#CC333F', '#EDC951'];
  var params = ['lp1', 'lp2', 'bp1', 'bp2', 'dp1', 'dp2'];
  var socket = io();
  loadPdPatch();
  _.forEach(params, function (param) {
    var slider = initSlider(param);
    setSliderCallbacks(slider, param, socket);
  });

  setConnectionEvents(socket, bandMemberColors);
});
