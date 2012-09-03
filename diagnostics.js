if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var graph = require('./graph'),
      fs = require('fs');

  graph.Graph.prototype.dotify = function() {
  	var res = "";
  	res += "digraph FG {\n";
	this.iter(function(from, to) {
	  res += '  "' + from.attr.pp() + '" -> "' + to.attr.pp() + '";\n';
	});
	res += "}\n";
	return res;
  };

  graph.Graph.prototype.writeDOTFile = function(fn) {
    fs.writeFileSync(fn, this.dotify());
  };

  return exports;
});