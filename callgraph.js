if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
	var flowgraph = require('./flowgraph'),
	    astutil = require('./astutil');

  function extractCG(ast, flow_graph) {
  	var edges = {},
  	    escaping = [],
  	    unknown = [];

  	function pp(v) {
  		if(v.type === 'CalleeVertex')
  			return astutil.ppPos(v.call);
  		if(v.type === 'FuncVertex')
  			return astutil.ppPos(v.func);
  		if(v.type === 'NativeVertex')
  			return v.name;
  		throw new Error("strange vertex: " + v);
  	}

  	function recordEdge(from, to) {
  		var pp_from = pp(from);
  		if(!(pp_from in edges))
  			edges[pp_from] = [];
  		edges[pp_from].push(pp(to));
  	}
    
    var reach = flow_graph.reachability(function(nd) { return nd.type !== 'UnknownVertex'; });
    var function_vertices = [];

    ast.attr.functions.forEach(function(fn) {
    	function_vertices.push(flowgraph.funcVertex(fn));
    });
    flowgraph.getNativeVertices().forEach(function(native) {
    	function_vertices.push(native);
    });

    function_vertices.forEach(function(v) {
    	var r = reach.getReachable(v);
    	r.forEach(function(nd) {
    		if(nd.type === 'UnknownVertex')
    			escaping.push(v);
    		else if(nd.type === 'CalleeVertex')
    			recordEdge(nd, v);
    	});
    });

    var unknown_r = reach.getReachable(flowgraph.unknownVertex());
    unknown_r.forEach(function(nd) {
    	if(nd.type === 'CalleeVertex')
    		unknown.push(nd);
    });

    return {
    	edges: edges,
    	escaping: escaping,
    	unknown: unknown
    };
  }

  exports.extractCG = extractCG;
  return exports;
});