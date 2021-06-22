/*
Object destructuing: assign without declaration
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	let a;
	const b = {'a': () => { return 1; } };
	({a} = b);
	a();
}

main();
