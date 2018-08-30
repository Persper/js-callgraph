/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { levenshtein } = require('../../src/levenshtein');

test('Test levenshtein', () => {
	expect(levenshtein('', '')).toBe(0);
	expect(levenshtein('house', 'house')).toBe(0);
	expect(levenshtein('badbadnotgood', 's')).toBe(13);
	expect(levenshtein('javascript', 'jaavscript')).toBe(2);
	expect(levenshtein('mit-license', 'mti-liceness')).toBe(4);
});
