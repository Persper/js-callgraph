// This file illustrates one of the unexpected behaviors of the call graph algorithm
// The algorithm should be able to distinguish the following two function calls,
// however, variables in global scope are handled by creating property vertex in the flow graph
let a = function func1 () { console.log('func1 is called!'); };
let b = { 'a': function func2 () { console.log('func2 is called!'); } };

b.a()
a()
