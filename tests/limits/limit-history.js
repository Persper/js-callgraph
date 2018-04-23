// This file illustrates one of the limitations of the call graph algorithm
// Only func2 is called in main function,
// but the algorithm can't rule out the possibility that func1 is called too
function main () {
    let a = function func1 () { console.log('func1 is called!'); };
    let b = a;
    b = function func2() { console.log('func2 is called!'); };
    a = b;
    a(); // func2 is called
    b(); // func2 is called
}

main();
