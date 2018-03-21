var x = 5;

function f(a) {
    return 2 * a;
}

y = f(x);
f(2);

function j(b) {
  return f(b);
}

function g(h, y) {
  j(4);
  return h(y);
}

g(f, x + 8);
