/*
Destructured parameter
See the last code example in the following link:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
*/
let v = function () { return 0; };

function main () {
	function f ([u, [v]]) {
		return u + v();
	}
	const f2 = () => { return 2; };
	f([1, [f2]]);
}

main();

/*
Before supporting nested destructuring, running

	node src/main.js --cg tests/es6/destructured-parameter3.js --strategy DEMAND

gives the following output:

	'f' (destructured-parameter3.js@10:266-269) -> 'undefined' (destructured-parameter3.js@6:181-206)
	'f' (destructured-parameter3.js@10:266-269) -> 'undefined' (destructured-parameter3.js@12:286-305)
	'main' (destructured-parameter3.js@13:308-320) -> 'f' (destructured-parameter3.js@9:229-273)
	'global' (destructured-parameter3.js@16:325-331) -> 'main' (destructured-parameter3.js@8:209-323)

Note that the anonymous function defined on line 6 and assigned to
global variable v is never called in the program, which our algorithm mistakenly detects that
it's called by function f.
This is due to the nested destructuring on line 9 is not handled correctly.
v on line 9 is not found in the scope, and thus is considered as a global variable at line 10,
which leads to the error of connecting Prop(v) -> Callee(10).
*/