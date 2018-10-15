/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { trackFunctions } = require('../../src/trackFunctions');
const astutil = require('../../src/astutil');
const fs = require('fs');

test('Test trackFunctions', () => {
	const truth = {
				"Page.js:anon:2:2:64": "Page.js:anon:3:3:64",
				"Page.js:anon:3:3:60": "Page.js:anon:4:4:60",
				"Page.js:anon:4:4:34": "Page.js:anon:5:5:34",
				"Page.js:anon:5:5:53": "Page.js:anon:6:6:53",
				"Page.js:anon:6:6:62": "Page.js:anon:7:7:62",
    }
	const oldFname = 'tests/jest/Page.old';
	const newFname = 'tests/jest/Page.new';
	const oldSrc = fs.readFileSync(oldFname, 'utf-8');
	const newSrc = fs.readFileSync(newFname, 'utf-8');
	const oldAST = astutil.astFromSrc('Page.js', oldSrc);
	const newAST = astutil.astFromSrc('Page.js', newSrc);
	const oldFuncLst = astutil.getFunctions(oldAST);
	const newFuncLst = astutil.getFunctions(newAST);
	expect(trackFunctions(oldFuncLst, newFuncLst)).toEqual(truth);
});
