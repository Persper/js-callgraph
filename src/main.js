/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Max Schaefer - initial API and implementation
 *******************************************************************************/

var bindings = require('./bindings'),
    astutil = require('./astutil'),
    pessimistic = require('./pessimistic'),
    semioptimistic = require('./semioptimistic'),
    diagnostics = require('./diagnostics'),
    callbackCounter = require('./callbackCounter'),
    requireJsGraph = require('./requireJsGraph');
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

argParser.addArgument(
    [ '--strategy' ],
    { help: 'interprocedural propagation strategy; one of NONE, ONESHOT (default), DEMAND, and FULL (not yet implemented) '}
);

argParser.addArgument(
    [ '--countCB' ],
    { nargs: 0,
        help: 'Counts the number of callbacks.'
    }
);

argParser.addArgument(
    [ '--reqJs' ],
    { nargs: 0,
        help: 'Make a RequireJS dependency graph.'
    }
);

var r = argParser.parseKnownArgs();
var args = r[0],
    files = r[1];

args.strategy = args.strategy || 'ONESHOT';
if (!args.strategy.match(/^(NONE|ONESHOT|DEMAND|FULL)$/)) {
    argParser.printHelp();
    process.exit(-1);
}
if (args.strategy === 'FULL') {
    console.warn('strategy FULL not implemented yet; using DEMAND instead');
    args.strategy = 'DEMAND';
}


var times = [];
if (args.time) console.time("parsing  ");
var ast = astutil.buildAST(files);
if (args.time) console.timeEnd("parsing  ");

if (args.time) console.time("bindings ");
bindings.addBindings(ast);
if (args.time) console.timeEnd("bindings ");

if (args.time) console.time("callgraph");
var cg;
if (args.strategy === 'NONE' || args.strategy === 'ONESHOT')
    cg = pessimistic.buildCallGraph(ast, args.strategy === 'NONE');
else if (args.strategy === 'DEMAND')
    cg = semioptimistic.buildCallGraph(ast);
if (args.time) console.timeEnd("callgraph");

if (args.fg)
    console.log(cg.fg.dotify());

if (args.countCB)
    callbackCounter.countCallbacks(ast);

if (args.reqJs)
    requireJsGraph.makeRequireJsGraph(ast).forEach(function(edge) {
        console.log(edge.toString());
    });

if (args.cg) {
    function pp(v) {
        if (v.type === 'CalleeVertex')
            return astutil.ppPos(v.call);
        if (v.type === 'FuncVertex')
            return astutil.ppPos(v.func);
        if (v.type === 'NativeVertex')
            return v.name;
        throw new Error("strange vertex: " + v);
    }

    cg.edges.iter(function (call, fn) {
        console.log(pp(call) + " -> " + pp(fn));
    });
}