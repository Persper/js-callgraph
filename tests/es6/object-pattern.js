/*
Object destructuing: basic assignment
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	const b = {'a': () => { return 1; } };
	const {a} = b;
	a();
}

main();
