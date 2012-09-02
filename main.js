var bindings = require('./bindings'),
    flowgraph = require('./flowgraph'),
    astutil = require('./astutil'),
    stopwatch = require('./stopwatch'),
    callgraph = require('./callgraph'),
    natives = require('./natives'),
    nativeFlows = require('./harness').nativeFlows,
    fs = require('fs'),
    ArgumentParser = require('argparse').ArgumentParser;

 var argParser = new ArgumentParser({
 	addHelp: true,
 	description: 'Call graph generator'
 });

 argParser.addArgument(
 	[ '--fg' ],
 	{ nargs: 0,
 	  help: 'print flow graph' }
);

 argParser.addArgument(
 	[ '--cg' ],
 	{ nargs: 0,
 	  help: 'print call graph' }
);

 argParser.addArgument(
 	[ '--time' ],
 	{ nargs: 0,
 	  help: 'print timings' }
);

var r = argParser.parseKnownArgs();
var args = r[0],
    files = r[1];

var sources = files.map(function(file) {
	return { filename: file,
	         program: fs.readFileSync(file, 'utf-8') };
});
var times = [];

if(args.time) console.time("parsing");
var ast = astutil.buildAST(sources);
if(args.time) console.timeEnd("parsing");

if(args.time) console.time("bindings");
bindings.addBindings(ast);
if(args.time) console.timeEnd("bindings");

if(args.time) console.time("flowgraph");
var fg = flowgraph.buildOneShotCallGraph(ast);
natives.addNativeFlowEdges(nativeFlows, fg);
flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
if(args.time) console.timeEnd("flowgraph");

if(args.time) console.time("callgraph");
var cg = callgraph.extractCG(ast, fg);
if(args.time) console.timeEnd("callgraph");

if(args.fg) {
	console.log("digraph FG {")
	fg.iter(function(from, to) {
		console.log('"' + from.attr.pp() + '" -> "' + to.attr.pp() + '";');
	});
	console.log("}");
}

if(args.cg) {
  function pp(v) {
    if(v.type === 'CalleeVertex')
  	  return astutil.ppPos(v.call);
  	if(v.type === 'FuncVertex')
  	  return astutil.ppPos(v.func);
  	if(v.type === 'NativeVertex')
  	  return v.name;
  	throw new Error("strange vertex: " + v);
  }

  cg.edges.iter(function(call, fn) {
  	console.log(pp(call) + " -> " + pp(fn));
  });
}