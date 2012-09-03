if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var graph = require('./graph'),
      natives = require('./natives'),
      flowgraph = require('./flowgraph'),
      callgraph = require('./callgraph');

  function buildCallGraph(ast) {
  	var fg = new graph.Graph();
  	natives.addNativeFlowEdges(fg);
  	flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);

  	var changed;  //var iter = 0;
  	do {
  	  changed = false;

      //console.log("iteration #" + (++iter));
      //fg.writeDOTFile("/home/mschaefer/tmp/fg" + iter + ".dot");

  	  var reach = fg.reachability(function(nd) { return nd.type !== 'UnknownVertex'; });

      ast.attr.calls.forEach(function(call) {
	      var res = flowgraph.resVertex(call);
	      if(!res.attr.interesting)
	        reach.iterReachable(res, function(nd) {
            if(nd.type === 'CalleeVertex') {
              //console.log(res.attr.pp() + " is interesting");
              res.attr.interesting = true;
            }
	  	    });
	    });

  	  ast.attr.functions.forEach(function(fn) {
  	  	var interesting = false, nparams = fn.params.length;

  	  	for(var i=0;i<=nparams;++i) {
  	  	  var param = flowgraph.parmVertex(fn, i);
  	  	  if(!param.attr.interesting) {
            //if(i > 0) {
            //  console.log("parameter " + param.attr.pp() + " flows into " + reach.getReachable(param).map(function(nd) { return nd.attr.pp(); }));
            //}
  	  	    reach.iterReachable(param, function(nd) {
  	  	  	  if(nd.type === 'CalleeVertex') {
  	  	  	  	param.attr.interesting = true;
                //console.log(param.attr.pp() + " is interesting");
              }
  	  	    });
          }
  	  	  interesting = interesting || param.attr.interesting;
  	  	}
  	  	
	  	  reach.iterReachable(flowgraph.funcVertex(fn), function(nd) {
  	  	  if(nd.type === 'CalleeVertex') {
  	  	    var call = nd.call, res = flowgraph.resVertex(call);

  	  	    if(res.attr.interesting) {
  	  	      var ret = flowgraph.retVertex(fn);
  	  	      if(!fg.hasEdge(ret, res)) {
  	  	      	changed = true;
  	  	      	fg.addEdge(ret, res);
                //console.log("adding " + ret.attr.pp() + " -> " + res.attr.pp());
  	  	      }
  	  	    }

  	  	    if(interesting)
  	  	  	  for(var i=0;i<=nparams;++i) {
  	  	  	    if(i > call.arguments.length)
  	  	  	  	  break;

  	  	  	  	var param = flowgraph.parmVertex(fn, i);
  	  	  	  	if(param.attr.interesting) {
  	  	  	  	  var arg = flowgraph.argVertex(call, i);
  	  	  	  	  if(!fg.hasEdge(arg, param)) {
  	  	  	  	  	changed = true;
  	  	  	  	  	fg.addEdge(arg, param);
                    //console.log("adding " + arg.attr.pp() + " -> " + param.attr.pp());
  	  	  	  	  }
  	  	  	  	}
  	  	  	  }
  	  	 }
  	  	});
  	  });
  	} while(changed);

  	return callgraph.extractCG(ast, fg);
  }

  exports.buildCallGraph = buildCallGraph;
  return exports;
});