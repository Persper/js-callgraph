var esprima = require('./esprima'),
    fs = require('fs'),
    bindings = require('./bindings'),
    flowgraph = require('./flowgraph'),
    astutil = require('./astutil');

var prog = fs.readFileSync(process.argv[2], 'utf-8');
var ast = esprima.parse(prog, { loc: true, range: true });
astutil.init(ast);
bindings.addBindings(ast);
var fg = flowgraph.buildFlowGraph(ast);

console.log("digraph FlowGraph {");
fg.iter(function(from, to) {
  console.log('  "' + from.attr.node_pp + '" -> "' + to.attr.node_pp + '"');
});
console.log("}");