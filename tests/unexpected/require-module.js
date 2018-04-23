// This module directly assigns the constructor function for User to module.exports
let User = function(name, email) {
	this.name = name;
	this.email = email;
};

module.exports = User;
