// This module directly assigns the constructor function for User to module.exports
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(function() {
	let User = function(name, email) {
		this.name = name;
		this.email = email;
	};
	return User;
});
