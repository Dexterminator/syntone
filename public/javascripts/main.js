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
    var pdId = instrumentId + 'midi';
    var midiValue = keyNumber + 59;
    console.log(keyId);
    var keyElement = $(keyId);
    var keyClass = keyElement.hasClass('whiteKey') ? 'white-active-key' : 'black-active-key';
    var pressed = false;

    keyElement
      .mousedown(function () {
        pressed = true;
        keyElement.addClass(keyClass);
        Pd.send(pdId, [midiValue, 1]);
        console.log('press ' + keyId);
      })
      .mouseup(function () {
        keyElement.removeClass(keyClass);
        if (pressed) {
          pressed = false;
          Pd.send(pdId, [midiValue, 0]);
          console.log('unpress ' + keyId);
        }
      })
      .mouseenter(function (event) {
        if (event.buttons === 1) {
          pressed = true;
          keyElement.addClass(keyClass);
          Pd.send(pdId, [midiValue, 1]);
          console.log('press ' + keyId);
        }
      })
      .mouseleave(function () {
        if (pressed) {
          pressed = false;
          keyElement.removeClass(keyClass);
          Pd.send(pdId, [midiValue, 0]);
          console.log('unpress ' + keyId);
        }
      });
  });
}

function mapKeyboard() {
  var keyMap = [
    {char: 'A', num: 1},
    {char: 'W', num: 2},
    {char: 'S', num: 3},
    {char: 'E', num: 4},
    {char: 'D', num: 5},
    {char: 'F', num: 6},
    {char: 'T', num: 7},
    {char: 'G', num: 8},
    {char: 'Y', num: 9},
    {char: 'H', num: 10},
    {char: 'U', num: 11},
    {char: 'J', num: 12},
  ];
  $('body')
    .keydown(function (event) {
      var char = String.fromCharCode(event.keyCode);
      var foundMapping = _.find(keyMap, function (mapping) {
        return char === mapping.char;
      });

      if (foundMapping) {
        var keyId = '#lkey' + foundMapping.num;
        $(keyId).mousedown();
      }
    })
    .keyup(function (event) {
      var char = String.fromCharCode(event.keyCode);
      var foundMapping = _.find(keyMap, function (mapping) {
        return char === mapping.char;
      });

      if (foundMapping) {
        var keyId = '#lkey' + foundMapping.num;
        $(keyId).mouseup();
      }
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
  mapKeyboard();
});
