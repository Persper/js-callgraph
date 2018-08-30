/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const fs = require('fs');
const Parser = require('../../src/parsePatch').Parser;

/* test parser.parse */
// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_detect_change.py
test('Tests parser.parse', () => {
    const parser = new Parser();

    const examplePatch = fs.readFileSync('tests/jest/example.patch', 'utf-8');

    const parsingTruth = {
        'adds': [[7, 31], [27, 3], [44, 1], [50, 2], [70, 1], [77, 2], [99, 2]],
        'dels': [[32, 44], [56, 70]]
    };

    expect(parser.parse(examplePatch)).toEqual(parsingTruth);
});

// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_inverse_diff.py
test('Tests parser.inverse', () => {
    const parser = new Parser();
    const parsingTruth = {
        'adds': [[7, 31], [27, 3], [44, 1], [50, 2], [70, 1], [77, 2], [99, 2]],
        'dels': [[32, 44], [56, 70]]
    }

    const adds = parsingTruth['adds'];
    const dels = parsingTruth['dels'];

    const invTruth = {
        'adds': [[65, 13], [79, 15]],
        'dels': [[8, 38], [59, 61], [66, 66], [73, 74], [80, 80], [88, 89], [112, 113]]
    };

    expect(parser.inverse(adds, dels)).toEqual(invTruth);
});
