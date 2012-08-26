if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  function mangle(name) {
    return '$' + name;
  }
  
  function Symtab(outer) {
    var self = Object.create(outer || Symtab.prototype);
    self.outer = outer;
    return self;
  }
  
  Symtab.prototype.get = function(name, deflt) {
    var mangled = mangle(name);
    if(!deflt || this.has(name))
      return this[mangled];
    this[mangled] = deflt;
    return deflt;
  };
  
  Symtab.prototype.has = function(name) {
    return mangle(name) in this;
  };
  
  Symtab.prototype.set = function(name, value) {
    return this[mangle(name)] = value;
  };
  
  exports.Symtab = Symtab;
  return exports;
});