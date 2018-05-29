const fs = require('fs');
const assert = require('assert')
const Parser = require('../src/parsePatch').Parser;

const parser = new Parser();
const examplePatch = fs.readFileSync('example.patch', 'utf-8');

/* test parser.parse */
// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_detect_change.py
const parsingTruth = {
	'adds': [[7, 31], [27, 3], [44, 1], [50, 2], [70, 1], [77, 2], [99, 2]],
	'dels': [[32, 44], [56, 70]]
}
// console.log(parser.parse(examplePatch));
assert.deepEqual(parser.parse(examplePatch), parsingTruth);

/* test parser.inverse */
const adds = parsingTruth['adds']; 
const dels = parsingTruth['dels']; 
// for ground truth, see here:
// https://github.com/Persper/code-analytics/blob/master/test/test_graphs/test_inverse_diff.py
const invTruth = {
	'adds': [[65, 13], [79, 15]],
	'dels': [[8, 38], [59, 61], [66, 66], [73, 74], [80, 80], [88, 89], [112, 113]]
}
// console.log(parser.inverse(adds, dels));
assert.deepEqual(parser.inverse(adds, dels), invTruth);
