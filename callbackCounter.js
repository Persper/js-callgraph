if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {
    var astutil = require('./astutil'),
        graph = require('./graph');

    function countCallbacks(ast) {
        var callbacks = [];
        var enclosingFunctionParameters = [];
        var functionDeclarationParameter = 0, functionExpressionParameter = 0;
        astutil.visit(ast, function(node) {
            switch (node.type) {
                case 'CallExpression' :
                    //FIND ARGUMENT AS PARAMETER IN ENCLOSING FUNCTION.
                    var callee = node.callee, functionName = callee.name;
                    var enclosingFunctionParameter = findEnclosingFunctionParameter(callee, functionName);
                    if (enclosingFunctionParameter !== null && enclosingFunctionParameters.indexOf(enclosingFunctionParameter) === -1) {
                        callbacks.push(node);
                        enclosingFunctionParameters.push(enclosingFunctionParameter);
                    }
                break;

                case 'FunctionDeclaration' :
                    functionDeclarationParameter += node.params.length;
                break;

                case 'FunctionExpression' :
                    functionExpressionParameter += node.params.length;
                break;
            }
        });
        var totalParameters = functionDeclarationParameter + functionExpressionParameter;
        var callbackPercentage = callbacks.length / totalParameters * 100;
        console.log("I found " + callbacks.length + " callback usages. In total we have " + functionDeclarationParameter + " function declaration parameters and " + functionExpressionParameter + " function expression parameters.");
        console.log("This makes a total of " + totalParameters + " parameters. Which means that (counting each function once as a callback) " + callbackPercentage + " percent of parameters are callbacks.");
    }

    function findEnclosingFunctionParameter(node, functionName) {
        var enclosingFunction = node.attr.enclosingFunction;
        if (!enclosingFunction) {
            return null;
        }

        var matchingParameter = findFirst(enclosingFunction.params, isParameterWithName(functionName));
        if (matchingParameter !== null) {
            return matchingParameter;
        }

        return findEnclosingFunctionParameter(enclosingFunction, functionName);
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