if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
	var start, quiet = false;

	exports.setQuiet = function(q) {
		quiet = q;
	};

	exports.start = function() {
		start = +new Date();
	};

	exports.mark = function(task) {
		end = +new Date();
		if(!quiet)
			console.log(task + " took " + ((end-start)/1000).toFixed(2) + " seconds");
	};

	return exports;
});