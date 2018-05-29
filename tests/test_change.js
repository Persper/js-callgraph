const assert = require('assert');
const { detectChange, getIntersectedLength } = require('../src/detectChange');

// use same test from https://github.com/Persper/code-analytics/blob/master/persper/graphs/detect_change.py
assert.equal(getIntersectedLength([1, 9], [2, 8]), 7);
assert.equal(getIntersectedLength([2, 8], [1, 9]), 7);
assert.equal(getIntersectedLength([1, 4], [1, 5]), 4);
assert.equal(getIntersectedLength([2, 10], [4, 11]), 7);
