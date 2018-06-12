const { detectChange, getIntersectedLength } = require('../../src/detectChange');

test('Test getIntersectedLength', () => {
  expect(getIntersectedLength([1, 9], [2, 8])).toBe(7);
  expect(getIntersectedLength([2, 8], [1, 9])).toBe(7);
  expect(getIntersectedLength([1, 4], [1, 5])).toBe(4);
  expect(getIntersectedLength([2, 10], [4, 11])).toBe(7);
});
