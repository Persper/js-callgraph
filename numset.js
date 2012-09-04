/**
 * Facade module implementing sets of non-negative integers.
 * Allows to easily switch to a different implementation.
 */

if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var impl = require('./olist');

  for(var p in impl)
    exports[p] = impl[p];

  return exports;
});