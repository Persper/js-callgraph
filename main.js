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
 	[ '--profile' ],
 	{ help: 'profile by running the given number of times' }
);

var r = argParser.parseKnownArgs();
var args = r[0],
    files = r[1];

var sources = files.map(function(file) {
	return { filename: file,
	         program: fs.readFileSync(file, 'utf-8') };
});
var times = [];

for(var i=0,n=args.profile||1;i<n;++i) {
	var parse_time = 0,
	    bindings_time = 0,
	    fg_time = 0,
	    cg_time = 0;

	stopwatch.start();
	var ast = astutil.buildAST(sources);
	parse_time = stopwatch.stop();

	stopwatch.start();
	bindings.addBindings(ast);
	bindings_time = stopwatch.stop();

	stopwatch.start();
	var fg = flowgraph.buildOneShotCallGraph(ast);
	natives.addNativeFlowEdges(nativeFlows, fg);
	flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
	fg_time = stopwatch.stop();

	stopwatch.start();
	var cg = callgraph.extractCG(ast, fg);
	cg_time = stopwatch.stop();

	times.push({ parse: parse_time,
	             bindings: bindings_time,
	             fg: fg_time,
	             cg: cg_time });
}

if(args.profile || !args.fg && !args.cg) {
	function getProp(p) { return function(x) { return x[p]; }; }

	function arithMean(a) {
		if(a.length === 0)
			return 0;
		var sum = a.reduce(function(x, y) { return x+y; }, 0);
		return sum/a.length;
	}

	function truncMean(a, p) {
		var n = Math.floor(a.length*p);
		a.sort(function(x, y) { return x-y; });
		return arithMean(a.slice(n, a.length-n));
	}

	function ppTime(ms) {
		return (ms/1000).toFixed(2) + " seconds";
	}

	var parse_times = times.map(getProp("parse"));
	var bindings_times = times.map(getProp("bindings"));
	var fg_times = times.map(getProp("fg"));
	var cg_times = times.map(getProp("cg"));
	debugger;
	console.log("parsing  : " + ppTime(truncMean(parse_times, .05)));
	console.log("bindings : " + ppTime(truncMean(bindings_times, .05)));
	console.log("flowgraph: " + ppTime(truncMean(fg_times, .05)));
	console.log("callgraph: " + ppTime(truncMean(cg_times, .05)));
}

if(args.fg) {
	console.log("digraph FG {")
	fg.iter(function(from, to) {
		console.log('"' + from.attr.pp() + '" -> "' + to.attr.pp() + '";');
	});
	console.log("}");
}

if(args.cg) {
	for(var call in cg.edges)
		cg.edges[call].forEach(function(fn) {
			console.log(call + " -> " + fn);
		});
}