/*
Array destructuing: parsing an array returned from a function
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	const f = () => { return [() => { return 1; }]; };
	const [a] = f();
	a();
}

main();
