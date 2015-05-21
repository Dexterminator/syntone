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

function initSlider(paramSlider) {
  var slider = $('#' + paramSlider.param);
  slider.slider({
    orientation: "horizontal",
    range: 'min',
    min: paramSlider.min,
    max: paramSlider.max,
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

function setUpKeyboard(instrumentId, numberOfKeys) {
  _.forEach(_.range(1, numberOfKeys + 1), function (keyNumber) {
    var keyId = '#' + instrumentId + 'key' + keyNumber;
    console.log(keyId);
    var keyElement = $(keyId);
    var keyClass = keyElement.hasClass('whiteKey') ? 'white-active-key' : 'black-active-key';

    keyElement
      .mousedown(function () {
        keyElement.addClass(keyClass);
        console.log('press ' + keyId);
      })
      .mouseup(function () {
        keyElement.removeClass(keyClass);
        console.log('unpress ' + keyId);
      })
      .mouseenter(function (event) {
        if (event.buttons === 1) {
          keyElement.addClass(keyClass);
          console.log('press ' + keyId);
        }
      })
      .mouseleave(function () {
        keyElement.removeClass(keyClass);
        console.log('unpress ' + keyId);
      });
  });
}
$(function() {
  var bandMemberColors = ['#00A0B0', '#CC333F', '#EDC951'];
  var paramSliders = [
    {param: 'lp1', min: 0, max: 127},
    {param: 'lp2', min: 0, max: 100},
    {param: 'lp3', min: 0, max: 100},
    {param: 'bp1', min: 0, max: 100},
    {param: 'bp2', min: 0, max: 100},
    {param: 'bp3', min: 0, max: 100},
    {param: 'dp1', min: 0, max: 100},
    {param: 'dp2', min: 0, max: 100},
    {param: 'dp3', min: 0, max: 100}
  ];

  var socket = io();
  loadPdPatch();
  _.forEach(paramSliders, function (paramSlider) {
    var slider = initSlider(paramSlider);
    setSliderCallbacks(slider, paramSlider.param, socket);
  });
  setConnectionEvents(socket, bandMemberColors);
  setUpKeyboard('l', 12);
  setUpKeyboard('b', 12);
});
