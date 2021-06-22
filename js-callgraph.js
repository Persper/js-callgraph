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
    add_help: true,
    description: 'Call graph generator'
});

argParser.add_argument(
    '--fg',
    {
        action: 'store_true',
        help: 'print flow graph'
    }
);

argParser.add_argument(
    '--cg',
    {
        action: 'store_true',
        help: 'print call graph'
    }
);

argParser.add_argument(
    '--time',
    {
        action: 'store_true',
        help: 'print timings'
    }
);

argParser.add_argument(
    '--strategy',
    {
        help: 'interprocedural propagation strategy; one of NONE, ONESHOT (default), DEMAND, and FULL (not yet implemented)'
    }
);

argParser.add_argument(
    '--countCB',
    {
        action: 'store_true',
        help: 'Counts the number of callbacks.'
    }
);

argParser.add_argument(
    '--reqJs',
    {
        action: 'store_true',
        help: 'Make a RequireJS dependency graph.'
    }
);

argParser.add_argument(
    '--output',
    {
        nargs: 1,
        help: 'The output file name, which contains the results in JSON format. (extension: .json)'
    }
);
argParser.add_argument(
    '--filter',
    {
        nargs: 1,
        help: 'The filters contains file. The syntax of filtering readable in README.md'
    }
);

argParser.add_argument(
    '--tolerant',
    {
        action: 'store_true',
        help: 'Enable parsing in tolerant mode'
    }
);

argParser.add_argument(
    '-v', '--version',
    {
        action: 'version',
        version: '0.0.1'
    }
);

let r = argParser.parse_known_args();
const args = r[0];
const inputList = r[1];

JCG.setArgs(args);
JCG.setFiles(inputList);

if (args.filter !== undefined) {
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
