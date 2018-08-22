/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/*
 * This file includes the source preprocessors.
 * Preprocessors are meant to be run before the parser.
 * A preprocessor takes a string (src code) as input
 * and return a string (processed src code) as output.
 * All preprocessors should retain line numbers.
 */

const babel = require('babel-core');

const nameToFunc = {
	'flow': stripFlowPrep,
	'hashbang': trimHashbangPrep
};

/* Apply a list of preprocessors to src
Args:
	      src - A string, the source code to be processed
	    fname - A string, name of the source file
	prepNames - A list of preprocessor names
*/
function applyPreps(src, fname, prepNames) {
	try {
		for (let prepName of prepNames)
			src = nameToFunc[prepName](src);
	}
	catch (err) {
        console.log('-------------------------------------------');
        console.log('Warning: Preprocessing errored ' + fname);
        console.log(err.stack);
        console.log('-------------------------------------------');
        return null;
	}
	return src;
}

function stripFlowPrep(src) {
    return babel.transform(src, {
        presets: ['flow'],
        retainLines: true,
        parserOpts: {strictMode: false}
    }).code;
}

/* Trim hashbang to avoid the parser blowing up
Example:
    #!/usr/bin/env node
Reference:
    https://github.com/jquery/esprima/issues/1151
*/
function trimHashbangPrep(src) {
    if (src.substring(0, 2) === '#!') {
        var end = src.indexOf('\n');
        var filler = '';
        for (var i = 0; i < end; ++i) {
           filler += ' ';
        }
        src = filler + src.substring(end, src.length);
    }
    return src;
}

module.exports.applyPreps = applyPreps;
module.exports.stripFlowPrep = stripFlowPrep;
module.exports.trimHashbangPrep = trimHashbangPrep;

