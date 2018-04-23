// This file tests assigning a function object to an existing local variable
function main() {
	let a = 1;
	let b = function funcB () {
		console.log('funcB is called!');
	};
	a = b;
	a();
}

main();
