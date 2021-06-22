// this code is extracted from Libraries/vendor/core/toIterator.js of the following commit
// https://github.com/facebook/react-native/commit/a15603d8f1ecdd673d80be318293cee53eb4475d
class StringIterator {
  // 21.1.5.1 CreateStringIterator Abstract Operation
  constructor(string) {
    if (typeof string !== 'string') {
      throw new TypeError('Object is not a string');
    }
    this._iteratedString = string;
    this._nextIndex = 0;
  }

  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  next() {
    if (!this instanceof StringIterator) {
      throw new TypeError('Object is not a StringIterator');
    }

    if (this._iteratedString == null) {
      return createIterResultObject(undefined, true);
    }

    var index = this._nextIndex;
    var s = this._iteratedString;
    var len = s.length;

    if (index >= len) {
      this._iteratedString = undefined;
      return createIterResultObject(undefined, true);
    }

    var ret;
    var first = s.charCodeAt(index);

    if (first < 0xD800 || first > 0xDBFF || index + 1 === len) {
      ret = s[index];
    } else {
      var second = s.charCodeAt(index + 1);
      if (second < 0xDC00 || second > 0xDFFF) {
        ret = s[index];
      } else {
        ret = s[index] + s[index + 1];
      }
    }

    this._nextIndex = index + ret.length;

    return createIterResultObject(ret, false);
  }

  // 21.1.5.2.2 %StringIteratorPrototype%[@@ITERATOR_SYMBOL]()
  '@@iterator'() {
    return this;
  }
}

function createIterResultObject(value, done) {
  return {value: value, done: done};
}
