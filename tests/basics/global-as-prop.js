// This file illustrates one of the unexpected behaviors of the call graph algorithm
// The algorithm should be able to distinguish the following two function calls,
// however, variables in global scope are handled by creating property vertex in the flow graph
let a = function (x) { return x; }; 
let b = { 'a': function (x) { return x; }}; 

b.a()
a()
