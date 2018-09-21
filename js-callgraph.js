#!/usr/bin/env node

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
const fs = require('fs');

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
argParser.addArgument(
    ['--filter'],
    {
        nargs: 1,
        help: 'The filters contains file. The syntax of filtering readable in README.md'
    }
);

let r = argParser.parseKnownArgs();
const args = r[0];
const inputList = r[1];

JCG.setArgs(args);
JCG.setFiles(inputList);
if (args.filter !== null) {
    let filter = [];
    let filterFile = args.filter[0];
    if (!fs.existsSync(filterFile)) {
        console.warn('The path of filter file "' + filterFile + '" does not exists.');
    } else {
        let content = fs.readFileSync(filterFile, 'utf8').split(/\r?\n/);
        let lineNumber = 0;
        content.forEach(function (line) {
            line = line.trim();
            lineNumber++;

            if (line.trim().length <= 1)
                return;

            if (!line.startsWith("#")) {
                if (line.startsWith("+") || line.startsWith("-")) {
                    filter.push(line);
                } else {
                    console.warn("[" + filterFile + "] Line " + lineNumber + " contains a not valid filter: " + line);
                }
            }
        });
        JCG.setFilter(filter);
    }
}
JCG.setConsoleOutput(true);
/*
* The build return with a JSON of result.
 */
JCG.build();
