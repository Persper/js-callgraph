// Same code with global-as-prop.js, wrapped in a function
(function () {
  let a = function (x) { return x; };
  let b = {'a': function (x) { return x; }};
  a();
  b.a();
}());
