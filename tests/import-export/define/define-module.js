// This module directly assigns the constructor function for User to module.exports
define(function() {
  let User = function(name, email) {
  	this.name = name;
  	this.email = email;
  };

  return User;
});
