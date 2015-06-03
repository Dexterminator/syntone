var leadCustomPattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var bassCustomPattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var leadPatterns = [
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0]
];
var bassPatterns = [
  [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0]
];
var iconLookup = {
  0: '<span class="fa fa-circle-o"</span>',
  1: '<span class="fa fa-adjust"</span>',
  2: '<span class="fa fa-circle"</span>'
};

function loadPdPatch() {
  var patch;
  $.get('pd/Syntone.pd', function (example) {
    $.get('pd/SyntoneLead.pd', function (syntone) {
      Pd.registerAbstraction('SyntoneLead', syntone);
      patch = Pd.loadPatch(example);
      Pd.start();
      console.log(leadPatterns[0].join(' '));
      _.forEach(leadPatterns[0], function (elem, index) {
        console.log('rl' + (index + 1));
        Pd.send('rl' + (index + 1), [elem]);
      });
      _.forEach(bassPatterns[0], function (elem, index) {
        console.log('bl' + (index + 1));
        Pd.send('bl' + (index + 1), [elem]);
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
    Pd.send(param, [parseFloat(message)]);
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

function setUpKeyboard(instrumentId, numberOfKeys, socket) {
  function handlePress(keyElement, keyClass, pdId, midiValue, keyNumber, keyId) {
    keyElement.addClass(keyClass);
    Pd.send(pdId, [midiValue, 1]);
    socket.emit('keyEvent', {
      instrument: instrumentId,
      key: keyNumber,
      midiValue: midiValue,
      pressed: true
    });
    console.log('press ' + keyId);
  }

  function handleRelease(keyElement, keyClass, pdId, midiValue, keyNumber, keyId) {
    keyElement.removeClass(keyClass);
    // Pd.send(pdId, [midiValue, 0]); // This would have been so pretty
    Pd.send(pdId, [0]);
    socket.emit('keyEvent', {
      instrument: instrumentId,
      key: keyNumber,
      midiValue: midiValue,
      pressed: false
    });
    console.log('unpress ' + keyId);
  }

  _.forEach(_.range(1, numberOfKeys + 1), function (keyNumber) {
    var keyId = '#' + instrumentId + 'key' + keyNumber;
    var pdId = instrumentId + 'midi';
    var midiValue = keyNumber + 59;
    console.log(keyId);
    var keyElement = $(keyId);
    var keyClass = keyElement.hasClass('whiteKey') ? 'white-active-key' : 'black-active-key';
    var pressed = false;

    keyElement.mousedown(function () {
      pressed = true;
      handlePress(keyElement, keyClass, pdId, midiValue, keyNumber, keyId);
    });

    keyElement.mouseup(function () {
      if (pressed) {
        pressed = false;
        handleRelease(keyElement, keyClass, pdId, midiValue, keyNumber, keyId);
      }
    });

    keyElement.mouseenter(function (event) {
      if (event.buttons === 1) {
        pressed = true;
        handlePress(keyElement, keyClass, pdId, midiValue, keyNumber, keyId);
      }
    });

    keyElement.mouseleave(function () {
      if (pressed) {
        pressed = false;
        handleRelease(keyElement, keyClass, pdId, midiValue, keyNumber, keyId);
      }
    });
  });
}

function mapKeyboard(instrumentId) {
  var idPrefix = '#' + instrumentId + 'key';
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
    {char: 'K', num: 13},
    {char: 'O', num: 14},
    {char: 'L', num: 15},
    {char: 'P', num: 16},
  ];

  $('body').unbind('keydown');
  $('body')
    .keydown(function (event) {
      var char = String.fromCharCode(event.keyCode);
      if (char === 'Q') {
        $("[name='keymap-choice']").not(':checked').click();
        return;
      }

      var foundMapping = _.find(keyMap, function (mapping) {
        return char === mapping.char;
      });

      if (foundMapping && !$('#name-input').is(':focus')) {
        var keyId = idPrefix + foundMapping.num;
        $(keyId).mousedown();
      }
    })
    .keyup(function (event) {
      var char = String.fromCharCode(event.keyCode);
      var foundMapping = _.find(keyMap, function (mapping) {
        return char === mapping.char;
      });

      if (foundMapping) {
        var keyId = idPrefix + foundMapping.num;
        $(keyId).mouseup();
      }
    });
}

function setKeyBoardEvents(socket) {
  socket.on('keyEvent', function (keyInfo) {
    var keyId = '#' + keyInfo.instrument + 'key' + keyInfo.key;
    var keyElement = $(keyId);
    var keyClass = keyElement.hasClass('whiteKey') ? 'white-active-key' : 'black-active-key';
    if (keyInfo.pressed) {
      keyElement.addClass(keyClass);
      var pdId = keyInfo.instrument + 'midi';
      Pd.send(pdId, [keyInfo.midiValue, 1]);
    } else {
      keyElement.removeClass(keyClass);
    }
  });
}

function setupKeyboardChoice() {
  $('#radios').popover('show');
  $('#lead-choice').click(function () {
    mapKeyboard('l')
  });
  $('#bass-choice').click(function () {
    mapKeyboard('b')
  });
}

function setupNameInput(socket) {
  $('#name-submit').click(function () {
    socket.emit('name-changed', $('#name-input').val());
    $('#name-submit').fadeOut();
    $('#name-input').fadeOut();
  });
  socket.on('name-changed', function (nameInfo) {
    var bandMembers = $('#band-members');
    var memberElems = bandMembers.find('li');
    var changed = $(_.find(memberElems, function (memberElem) {
      return $(memberElem).html() === nameInfo.id;
    }));
    changed.html(nameInfo.name);
  });
}

function setupLeadPatternRadios() {
  var leadPatternRadios = $('#lpattern-choice input');
  leadPatternRadios.on('change', function () {
    var patternIndex = $("input[name='lead-pattern-choice']:checked").val();
    var pattern;
    if (patternIndex === 'custom') {
      $('#l-pattern-buttons').find('.pattern-button').each(function (i, button) {
        $(button).removeClass('disabled');
      });
      pattern = leadCustomPattern;
    } else {
      var pattern = leadPatterns[patternIndex];
      $('#l-pattern-buttons').find('.pattern-button').each(function (i, button) {
        $(button).addClass('disabled');
      });
    }
    $('#l-pattern-buttons').find('.pattern-button').each(function (i, button) {
      $(button).html(iconLookup[pattern[i]]);
    });
    _.forEach(pattern, function (elem, index) {
      console.log('rl' + (index + 1));
      Pd.send('rl' + (index + 1), [elem]);
    });
  });
}

function setupBassPatternRadios() {
  var leadPatternRadios = $('#bpattern-choice input');
  leadPatternRadios.on('change', function () {
    var patternIndex = $("input[name='bass-pattern-choice']:checked").val();
    var pattern;
    if (patternIndex === 'custom') {
      $('#b-pattern-buttons').find('.pattern-button').each(function (i, button) {
        $(button).removeClass('disabled');
      });
      pattern = bassCustomPattern;
    } else {
      var pattern = bassPatterns[patternIndex];
      $('#b-pattern-buttons').find('.pattern-button').each(function (i, button) {
        $(button).addClass('disabled');
      });
    }
    $('#b-pattern-buttons').find('.pattern-button').each(function (i, button) {
      $(button).html(iconLookup[pattern[i]]);
    });
    _.forEach(pattern, function (elem, index) {
      Pd.send('rb' + (index + 1), [elem]);
    });
  });
}

function setupPatternChoice() {
  setupLeadPatternRadios();
  setupBassPatternRadios();

  _.forEach(leadPatterns[0], function (elem, index) {
    Pd.send('rl' + (index + 1), [elem]);
  });

  _.forEach(bassPatterns[0], function (elem, index) {
    Pd.send('rb' + (index + 1), [elem]);
  });

  $('#l-pattern-buttons').find('.pattern-button').each(function (i, button) {
    $(button).html(iconLookup[leadPatterns[0][i]]);
  });

  $('#b-pattern-buttons').find('.pattern-button').each(function (i, button) {
    $(button).html(iconLookup[bassPatterns[0][i]]);
  });
}

function setupCustomPattern(instrumentId) {
  var buttonsId = '#' + instrumentId + '-pattern-buttons';
  var customPattern = instrumentId === 'l' ? leadCustomPattern : bassCustomPattern;
  $(buttonsId).find('.pattern-button').each(function (i, button) {
    $(button).click(function () {
      customPattern[i]++;
      customPattern[i] = customPattern[i] % 3;
      $(this).html(iconLookup[customPattern[i]]);
      _.forEach(customPattern, function (elem, index) {
        Pd.send('r' + instrumentId + (index + 1), [elem]);
      });
    })
  });
}

$(function() {
  var bandMemberColors = ['#00A0B0', '#CC333F', '#EDC951'];
  var paramSliders = [
    {param: 'lp1', min: 0, max: 127},
    {param: 'lp2', min: 0, max: 127},
    {param: 'lp3', min: 0, max: 127},
    {param: 'lp4', min: 0, max: 127},
    {param: 'bp1', min: 0, max: 127},
    {param: 'bp2', min: 0, max: 127},
    {param: 'bp3', min: 0, max: 127},
    {param: 'bp4', min: 0, max: 127},
  ];

  var socket = io();
  loadPdPatch();
  _.forEach(paramSliders, function (paramSlider) {
    var slider = initSlider(paramSlider);
    setSliderCallbacks(slider, paramSlider.param, socket);
  });
  setConnectionEvents(socket, bandMemberColors);
  setKeyBoardEvents(socket);
  setUpKeyboard('l', 24, socket);
  setUpKeyboard('b', 24, socket);
  mapKeyboard('l');
  setupKeyboardChoice();
  setupNameInput(socket);
  setupPatternChoice();
  setupCustomPattern('l');
  setupCustomPattern('b');
});
