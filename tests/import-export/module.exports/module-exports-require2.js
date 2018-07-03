// This file tests the most common usage of exports/require
let m1 = require('./module-exports-module2');
console.log("Adding %d to 10 gives us %d", m1.x, m1.addX(10));
