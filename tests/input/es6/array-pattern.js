/*
Array destructuing: basic variable assignment
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
*/
function main () {
	const a = [ () => { return 1; } ];
	let [b] = a;
	b();
}

main();
