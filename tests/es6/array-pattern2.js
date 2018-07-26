/*
Array destructuing: assignment separate from declaration
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	let b;
	const a = [ () => { return 1; } ];
	[b] = a;
	b();
}

main();
