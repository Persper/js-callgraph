// This file tests directly assigning a constructor function to module.exports
let User = require('./require-module');

let u = new User('random user', 'random-user@persper.org');
console.log("%s's email is %s", u.name, u.email);
