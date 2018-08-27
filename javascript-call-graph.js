/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/
const JCG = require("./src/runner");
var ArgumentParser = require('argparse').ArgumentParser;

var argParser = new ArgumentParser({
    addHelp: true,
    description: 'Call graph generator'
});

argParser.addArgument(
    ['--fg'],
    {
        nargs: 0,
        help: 'print flow graph'
    }
);

argParser.addArgument(
    ['--cg'],
    {
        nargs: 0,
        help: 'print call graph'
    }
);

argParser.addArgument(
    ['--time'],
    {
        nargs: 0,
        help: 'print timings'
    }
);

argParser.addArgument(
    ['--strategy'],
    {help: 'interprocedural propagation strategy; one of NONE, ONESHOT (default), DEMAND, and FULL (not yet implemented) '}
);

argParser.addArgument(
    ['--countCB'],
    {
        nargs: 0,
        help: 'Counts the number of callbacks.'
    }
);

argParser.addArgument(
    ['--reqJs'],
    {
        nargs: 0,
        help: 'Make a RequireJS dependency graph.'
    }
);

const r = argParser.parseKnownArgs();
const args = r[0];
const inputList = r[1];
args.json = args.json !== null;

JCG.args = args;
JCG.setFiles(inputList);
JCG.setConsoleOutput(true);
let result = JCG.build(true);
