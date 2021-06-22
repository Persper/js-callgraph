/*
Array destructuing: ignoring some return values
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	const f = () => { return [2, 3, () => { return 1; }]; };
	const [,,a] = f();
	a();
}

main();
