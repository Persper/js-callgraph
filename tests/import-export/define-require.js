// This file tests directly assigning a constructor function to module.exports
let user = require('./define-module');

let u = new user('random user', 'random-user@persper.org');
console.log("%s's email is %s", u.name, u.email);
