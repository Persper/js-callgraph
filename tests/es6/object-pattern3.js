/*
Object destructuing: assigning to new variable names
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	const b = {'a': () => { return 1; } };
	const {a: foo} = b;
	foo();
}

main();
