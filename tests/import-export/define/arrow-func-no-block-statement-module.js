// This module directly assigns the constructor function for User to module.exports
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(() => () => {return 1;});
