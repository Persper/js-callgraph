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
const ArgumentParser = require('argparse').ArgumentParser;

let argParser = new ArgumentParser({
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

argParser.addArgument(
    ['--output'],
    {
        nargs: 1,
        help: 'The output file name, which contains the JSON of result. (extension: .json)'
    }
);

let r = argParser.parseKnownArgs();
r[0].json = r[0].json !== null;
const args = r[0];
const inputList = r[1];

JCG.setArgs(args);
JCG.setFiles(inputList);
JCG.setConsoleOutput(true);
/*
* The build return with a JSON of result.
 */
JCG.build(true);
