let v = () => { return 1; };

function main () {
	v();
	[v] = [null];
}

main();
/*
This test illustrates how the current implementation incorrectly set decl_scope
for 'BindingPattern' in binding.js.
The arrow functinon defined on line 1 is called on line 4.
But when the 'ArrayPattern' on line 5 is visited, the name 'v' is added to local symbol table.
Later when flowgraph.js adds intra-procedural edges for line 4, the new edge will be

	Var(v) -> Callee(4)

instead of

	Prop(v) -> Callee(4)

resulting the call to arrow function defined on line 1 not detected.
*/
