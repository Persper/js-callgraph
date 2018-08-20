/*
Destructured parameter
See the last code example in the following link:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
*/
let v = function () { return 0; };

function main () {
	function f ({u: {v}}) {
		return v();
	}
	const f2 = () => { return 2; };
	f({u: {v: f2}});
}

main();

/*
Before supporting nested destructuring, running

	node src/main.js --cg tests/es6/destructured-parameter2.js --strategy DEMAND

gives the following output:

	'f' (destructured-parameter2.js@10:262-265) -> 'anon' (destructured-parameter2.js@6:181-206)
	'f' (destructured-parameter2.js@10:262-265) -> 'anon' (destructured-parameter2.js@12:282-301)
	'main' (destructured-parameter2.js@13:304-319) -> 'f' (destructured-parameter2.js@9:229-269)
	'global' (destructured-parameter2.js@16:324-330) -> 'main' (destructured-parameter2.js@8:209-322)

Note that the anonymous function defined on line 6 and assigned to
global variable v is never called in the program, which our algorithm mistakenly detects that
it's called by function f.
This is due to the nested destructuring on line 9 is not handled correctly.
v on line 9 is not found in the scope, and thus is considered as a global variable at line 10,
which leads to the error of connecting Prop(v) -> Callee(10).
*/