var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
          }
      }
      return function (Constructor, protoProps, staticProps) {
        if (protoProps)
         defineProperties(Constructor.prototype, protoProps);

      if (staticProps)
        defineProperties(Constructor, staticProps);

      return Constructor;
    }; 
}();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animal = function() {
  function Animal(name, color) {
    _classCallCheck(this, Animal);
    this.name = name
    this.color = color
  }

  _createClass(Animal, [{
    key: 'fn',
    get: function get() {
      return function() {return this.color;};
    }
  }]);
}();

var a = new Animal();
a.fn();
