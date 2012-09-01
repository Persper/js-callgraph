if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
	var start;

	exports.start = function() {
		start = +new Date();
	};

	exports.stop = function(task) {
		end = +new Date();
		return end-start;
	};

	return exports;
});