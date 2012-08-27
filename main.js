var bindings = require('./bindings'),
    flowgraph = require('./flowgraph'),
    astutil = require('./astutil'),
    stopwatch = require('./stopwatch'),
    callgraph = require('./callgraph'),
    natives = require('./natives'),
    fs = require('fs');

 var printFG = false,
     printCG = true;
 stopwatch.setQuiet(printCG || printFG);

stopwatch.start();
var sources = [];
for(var i=2;i<process.argv.length;++i)
	sources.push({ filename: process.argv[i],
	               program: fs.readFileSync(process.argv[i], 'utf-8') });
var ast = astutil.buildAST(sources);
stopwatch.mark("parsing");

stopwatch.start();
bindings.addBindings(ast);
stopwatch.mark("adding bindings");

stopwatch.start();
var fg = flowgraph.buildOneShotCallGraph(ast);
var nativeFlows = JSON.parse(fs.readFileSync('./harness.json', 'utf-8'));
natives.addNativeFlowEdges(nativeFlows, fg);
flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
stopwatch.mark("building flow graph");

stopwatch.start();
var cg = callgraph.extractCG(ast, fg);
stopwatch.mark("extracting call graph");

if(printFG) {
	console.log("digraph FG {")
	fg.iter(function(from, to) {
		console.log('"' + from.attr.pp() + '" -> "' + to.attr.pp() + '";');
	});
	console.log("}");
}

if(printCG) {
	for(var call in cg.edges)
		cg.edges[call].forEach(function(fn) {
			console.log(call + " -> " + fn);
		});
}