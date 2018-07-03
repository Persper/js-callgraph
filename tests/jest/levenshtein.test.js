const { levenshtein } = require('../../src/levenshtein');

test('Test levenshtein', () => {
	expect(levenshtein('', '')).toBe(0);
	expect(levenshtein('house', 'house')).toBe(0);
	expect(levenshtein('badbadnotgood', 's')).toBe(13);
	expect(levenshtein('javascript', 'jaavscript')).toBe(2);
	expect(levenshtein('mit-license', 'mti-liceness')).toBe(4);
});
