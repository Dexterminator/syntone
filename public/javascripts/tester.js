$(document).ready(function() {
	$('#jquery-test').append('I was appended by jQuery!');
	var lodashTest = $('#lodash-test');
	lodashTest.append('Calculated by lodash: ');
	_.map([1, 2, 3], function(n) {lodashTest.append((n * 3) + ' ')});

	var socket = io();
	socket.emit('test message', 'testing, testing');
	socket.on('test message', function (message) {
		$('#io-message').append(message);
	});

	var patch;
  $.get('pd/dynamic_sequencer_example.pd', function(example) {
  	$.get('pd/dynamic_sequencer2.pd', function(dynamicSequencer) {
	    // Loading the patch and abstraction
	    Pd.registerAbstraction('dynamic_sequencer2', dynamicSequencer);
	    patch = Pd.loadPatch(example);
	    $('#pd-starter').click(function(event) {
		    Pd.start();
	    });
	    $('#pd-stopper').click(function(event) {
		    Pd.stop();
	    });
	  });
  });
});