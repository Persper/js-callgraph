/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const { detectChange, getIntersectedLength } = require('../../src/detectChange');

test('Test getIntersectedLength', () => {
  expect(getIntersectedLength([1, 9], [2, 8])).toBe(7);
  expect(getIntersectedLength([2, 8], [1, 9])).toBe(7);
  expect(getIntersectedLength([1, 4], [1, 5])).toBe(4);
  expect(getIntersectedLength([2, 10], [4, 11])).toBe(7);
});
