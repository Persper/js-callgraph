const fs = require('fs');
const Parser = require('../src/parsePatch').Parser;

const parser = new Parser();
const examplePatch = fs.readFileSync('example.patch', 'utf-8');

// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_detect_change.py
console.log(parser.parse(examplePatch));

const adds = [[7, 31], [27, 3], [44, 1], [50, 2], [70, 1], [77, 2], [99, 2]];
const dels = [[32, 44], [56, 70]];

// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_inverse_diff.py
console.log(parser.inverse(adds, dels));
