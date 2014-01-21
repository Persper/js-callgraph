if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {
    var astutil = require('./astutil'),
        graph = require('./graph');

    function countCallbacks(ast) {
        var callbacks = [];
        astutil.visit(ast, function (node) {
            switch (node.type) {
                case 'CallExpression':
                //FIND ARGUMENT AS PARAMETER IN ENCLOSING FUNCTION.
                var callee = node.callee, functionName = callee.name;
                if (findEnclosingFunction(callee, functionName) !== null) {
                    callbacks.push(node);
                }
            }
        });
        console.log("I found " + callbacks.length + " callbacks.");
    }

    function findEnclosingFunction(node, functionName) {
        var enclosingFunction = node.attr.enclosingFunction;
        if (!enclosingFunction) {
            return null;
        }

        var matchingParameter = findFirst(enclosingFunction.params, isParameterWithName(functionName));
        if (matchingParameter !== null) {
            return matchingParameter;
        }

        return findEnclosingFunction(enclosingFunction, functionName);
    }

    function findFirst(array, predicate) {
        var soughtElement = null;
        array.forEach(function(element) {
            if (predicate(element) === true) {
                soughtElement = element;
                return false;
            }
        });
        return soughtElement;
    }

    function isParameterWithName(functionName) {
        return function(parameter) {
            return parameter.name === functionName;
        };
    }

    exports.countCallbacks = countCallbacks;
    return exports;
});