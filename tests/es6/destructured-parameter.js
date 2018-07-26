/*
Destructured parameter
See the last code example in the following link:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters
*/
function main () {
	function f ([x, y], {z}) {
		return x() + y + z();
	}
	const f2 = () => { return 2; };
	const f3 = () => { return 3; };
	f([f2, 2], {z: f3});
}

main();
