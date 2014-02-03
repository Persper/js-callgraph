if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {

    var assert = require('assert'),
        astutil = require('./astutil'),
        _ = require('./underscore'),
        fs = require('fs');


    function makeRequireJsGraph(ast) {
        assert.equal(1, ast.programs.length, "Can only have one starting point at the moment.");

        var rx = /^.*\\(.+\\)*(.+)\.(.+)$/g;
        var regexParse = rx.exec(ast.programs[0].attr.filename);
        var partialFileName = regexParse[2]  + ".js",
            fileName = "./" + partialFileName,
            folder = regexParse[0].split(/[a-zA-Z]+\.js/)[0].replace(/\/$/, "\\");
        var dependencyGraph = [];
        astutil.visit(ast, function(node) {
            switch (node.type) {
                case 'CallExpression' :
                    if (node.callee.name === "define" || node.callee.name === "require") {
                        var dependencies = [], argument = node.arguments[0];
                        if (argument.type === "ArrayExpression") {
                            argument.elements.forEach(function(element) {
                                dependencies.push(element.value + ".js");
                            });
                        } else if (argument.type === "Literal") {
                            dependencies.push(argument.value + ".js");
                        }
                        dependencies.forEach(function(dependency) {
                            dependencyGraph.push(new Dependency(fileName, dependency));
                        });
                    }
                break;
            }
        });
        dependencyGraph.map(function(dep){return dep.to}).forEach(function(outgoingDep) {
            var normOutgoingDep = outgoingDep.replace(/^.\//, "");
            normOutgoingDep = normOutgoingDep.replace(/^\//, "");
            normOutgoingDep = normOutgoingDep.replace(/\//, "\\");
            var newStart = folder + normOutgoingDep;
            if (fs.existsSync(newStart)) {
                var referencedAST = astutil.buildAST([newStart]);
                dependencyGraph = dependencyGraph.concat(makeRequireJsGraph(referencedAST))
            }
        });
        return _.uniq(dependencyGraph, function(edge) {
            return edge.toString();
        });
    }

    function Dependency(from, to) {
        this.from = from;
        this.to = to;

        this.toString = function() {
            return removeLeadingPointSlash(this.from) + " -> " + removeLeadingPointSlash(this.to);
        };

        function removeLeadingPointSlash(path) {
            return path.replace(/^\.?\//, "");
        }
    }
    exports.makeRequireJsGraph = makeRequireJsGraph;
    return exports;
});