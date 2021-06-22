/*
Since we introduced `GlobVertex`, this problem has been fixed and we can now distinguish
between the two function calls in this file.

Original Comment:
    This file illustrates one of the unexpected behaviors of the call graph algorithm
    The algorithm should be able to distinguish the following two function calls,
    however, variables in global scope are handled by creating property vertex in the flow graph
*/

let a = function (x) { return x; };
let b = { 'a': function (x) { return x; }};

b.a()
a()
