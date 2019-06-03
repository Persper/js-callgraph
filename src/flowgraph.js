/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/**
 * This module defines the machinery for extracting a flow graph from an AST.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var astutil = require('./astutil'),
        graph = require('./graph'),
        symtab = require('./symtab');

    /* Set up intraprocedural flow */
    function addIntraproceduralFlowGraphEdges(ast, flow_graph) {
        flow_graph = flow_graph || new graph.FlowGraph();
        astutil.visit(ast, function (nd) {
            switch (nd.type) {
                case 'ArrayExpression':
                    for (var i = 0; i < nd.elements.length; ++i)
                        if (nd.elements[i])
                            flow_graph.addEdge(vertexFor(nd.elements[i]), propVertex({ type: 'Literal',
                                value: i }));
                    break;

                // R1
                case 'AssignmentExpression':
                    if (nd.operator === '=')
                        flow_graph.addEdges(vertexFor(nd.right), [vertexFor(nd.left), vertexFor(nd)]);
                    break;

                // R9
                case 'CallExpression':
                    if (nd.callee.type === 'MemberExpression')
                        flow_graph.addEdge(vertexFor(nd.callee.object), argVertex(nd, 0));

                // R8 FALL THROUGH
                case 'NewExpression':
                    flow_graph.addEdge(vertexFor(nd.callee), calleeVertex(nd));
                    for (var i = 0; i < nd.arguments.length; ++i)
                        flow_graph.addEdge(vertexFor(nd.arguments[i]), argVertex(nd, i + 1));
                    flow_graph.addEdge(resVertex(nd), vertexFor(nd));
                    break;

                case 'CatchClause':
                    flow_graph.addEdge(unknownVertex(), varVertex(nd.param));
                    break;

                // R3
                case 'ConditionalExpression':
                    flow_graph.addEdge(vertexFor(nd.consequent), vertexFor(nd));
                    flow_graph.addEdge(vertexFor(nd.alternate), vertexFor(nd));
                    break;

                // R7
                case 'ClassDeclaration':
                case 'ClassExpression':
                    var body = nd.body.body;
                    if (nd.id)
                        for (let i = 0; i < body.length; ++i)
                            if (body[i].kind === 'constructor')
                                flow_graph.addEdge(funcVertex(body[i].value), vertexFor(nd.id));
                    break;

                case 'FunctionDeclaration':
                    /* This check is needed for:
                            export function () { ... }
                       as it will not have an id but will be
                       a FunctionDeclaration in ES6 */
                    if (nd.id)
                      flow_graph.addEdge(funcVertex(nd), vertexFor(nd.id));
                    break;

                // R6
                case 'FunctionExpression':
                case 'ArrowFunctionExpression':
                    flow_graph.addEdge(funcVertex(nd), exprVertex(nd));
                    if (nd.id)
                        flow_graph.addEdge(funcVertex(nd), varVertex(nd.id));
                    break;

                // R2, R4
                case 'LogicalExpression':
                    if (nd.operator === '||')
                        flow_graph.addEdge(vertexFor(nd.left), vertexFor(nd));
                    flow_graph.addEdge(vertexFor(nd.right), vertexFor(nd));
                    break;

                // R5
                case 'ObjectExpression':
                    nd.properties.forEach(function (prop) {
                        if (prop.kind === 'init') {
                            // Temporary fix for computed property names
                            if (prop.key.type === 'Identifier' || prop.key.type == 'Literal')
                                flow_graph.addEdge(vertexFor(prop.value), propVertex(prop.key));
                        }
                    });
                    break;

                // R10
                case 'ReturnStatement':
                    if (nd.argument)
                        flow_graph.addEdge(vertexFor(nd.argument), retVertex(nd.attr.enclosingFunction));
                    break;

                case 'SequenceExpression':
                    flow_graph.addEdge(vertexFor(nd.expressions[nd.expressions.length - 1]), vertexFor(nd));
                    break;

                case 'ThrowStatement':
                    flow_graph.addEdge(vertexFor(nd.argument), unknownVertex());
                    break;

                case 'VariableDeclarator':
                    // Only handle the case that nd.id is an Identifer
                    // ObjectPattern and ArrayPattern are handled separately
                    if (nd.id.type === 'Identifier' && nd.init)
                        flow_graph.addEdge(vertexFor(nd.init), vertexFor(nd.id));
                    break;

                // ES6 rule, similar to object expression
                // Currently don't support rest and default params
                case 'ObjectPattern':
                    for (let prop of nd.properties)
                        // Assuming prop.key and prop.value are Identifers
                        flow_graph.addEdge(propVertex(prop.key), vertexFor(prop.value));
                    break;

                // ES6 rule, similar to array expression
                // Currently don't support rest and default params
                case 'ArrayPattern':
                    for (let i = 0; i < nd.elements.length; i++) {
                        // Array destructuring can ignore some values, so check null first
                        if (nd.elements[i])
                            flow_graph.addEdge(
                                propVertex({ type: 'Literal', value: i }),
                                vertexFor(nd.elements[i])
                            );
                    }
                    break;

                case 'MethodDefinition':
                    if (nd.key.type === 'Identifier')
                        flow_graph.addEdge(funcVertex(nd.value), propVertex(nd.key))
                    break;

                case 'WithStatement':
                    // throw new Error("'with' statement not supported");
            }
        });
        return flow_graph;
    }

    /* Return the flow graph vertex corresponding to a given AST node. */
    function vertexFor(nd) {
        var decl, body;
        switch (nd.type) {
            case 'Identifier':
                // global variables use a global vertex, local variables a var vertex
                if (!nd.attr.scope)
                    debugger;
                decl = nd.attr.scope.get(nd.name);
                return decl && !decl.attr.scope.global ? varVertex(decl) : globVertex(nd);
            case 'ThisExpression':
                // 'this' is treated like a variable
                decl = nd.attr.scope.get('this');
                return decl ? varVertex(decl) : exprVertex(nd);
            case 'ClassExpression':
                if (nd.id)
                  return vertexFor(nd.id);

                body = nd.body.body;
                for (let i = 0; i < body.length; ++i)
                    if (body[i].kind === 'constructor')
                        return funcVertex(body[i].value);
                break;
            case 'MemberExpression':
                // ignore dynamic property accesses
                if (!nd.computed)
                    return propVertex(nd.property);
        }
        return exprVertex(nd);
    }

    // variable vertices are cached at the variable declarations
    function varVertex(nd) {
        if (nd.type !== 'Identifier')
            throw new Error("invalid variable vertex");

        return nd.attr.var_vertex
            || (nd.attr.var_vertex = {
            type: 'VarVertex',
            node: nd,
            attr: { pp: function () {
                return 'Var(' + nd.name + ', ' + astutil.ppPos(nd) + ')';
            } }
        });
    }

    // global cache of property vertices
    var propVertices = new symtab.Symtab();

    // retrieve property vertex from cache, or create new one
    function propVertex(nd) {
        var p;
        if (nd.type === 'Identifier')
            p = nd.name;
        else if (nd.type === 'Literal')
            // this case handles array, property field: 0, 1, 2...
            p = nd.value + "";
        else
            throw new Error("invalid property vertex");

        return propVertices.get(p, {
            type: 'PropertyVertex',
            name: p,
            attr: {
                pp: function () { return 'Prop(' + p + ')'; }
            }
        });
    }

    // global cache of global vertices
    let globVertices = new symtab.Symtab();

    // globVertices are propVertices in the global scope
    // similar to propVertex, globVertex doesn't have an associated ast node
    function globVertex(nd) {
        let gp;
        if (nd.type === 'Identifier')
            gp = nd.name;
        else if (nd.type === 'Literal')
            // this case handles array, property field: 0, 1, 2...
            gp = nd.value + "";
        else
            throw new Error("invalid global vertex");

        return globVertices.get(gp, {
            type: 'GlobalVertex',
            name: gp,
            attr: {
                pp: function () { return 'Glob(' + gp + ')'; }
            }
        });
    }

    // vertices representing well-known native functions
    var nativeVertices = new symtab.Symtab();

    function nativeVertex(name) {
        return nativeVertices.get(name, { type: 'NativeVertex',
            name: name,
            attr: { pp: function () {
                return name;
            } } });
    }

    function getNativeVertices() {
        return nativeVertices.values();
    }

    // special ``unknown'' vertex representing flow that is not explicitly modelled
    var theUnknownVertex = { type: 'UnknownVertex',
        attr: { pp: function () {
            return 'Unknown';
        } } };

    function unknownVertex() {
        return theUnknownVertex;
    }

    // function vertex
    function funcVertex(fn) {
        if (!astutil.isFunction(fn))
            throw new Error("invalid function vertex");
        return fn.attr.func_vertex
            || (fn.attr.func_vertex = {
            type: 'FuncVertex',
            func: fn,
            attr: { pp: function () {
                return 'Func(' + astutil.ppPos(fn) + ')';
            } }
        });
    }

    // parameter vertex
    function parmVertex(fn, i) {
        if (!astutil.isFunction(fn))
            throw new Error("invalid function vertex");
        var vertex;
        if (i === 0) {
            vertex = varVertex(fn.attr.scope.get('this'));
        } else {
            // In ES6, fn.params[i - 1] might not be an Identifier
            // vertex = varVertex(fn.params[i - 1]);
            vertex = vertexFor(fn.params[i - 1]);
        }
        return vertex;
    }

    // vertex representing function return value
    function retVertex(fn) {
        if (!astutil.isFunction(fn))
            throw new Error("invalid return vertex");

        return fn.attr.ret_vertex
            || (fn.attr.ret_vertex = {
            type: 'ReturnVertex',
            node: fn,
            attr: { pp: function () {
                return 'Ret(' + astutil.ppPos(fn) + ')';
            } }
        });
    }

    // vertex representing callee at a call site
    function calleeVertex(nd) {
        if (nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
            throw new Error("invalid callee vertex");

        return nd.attr.callee_vertex
            || (nd.attr.callee_vertex = {
            type: 'CalleeVertex',
            call: nd,
            attr: { pp: function () {
                return 'Callee(' + astutil.ppPos(nd) + ')';
            } }
        });
    }

    // vertex representing the ith argument at a call site; 0th argument is receiver
    function argVertex(nd, i) {
        if (nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
            throw new Error("invalid callee vertex");
        if (i === 0) {
            return nd.attr.receiver_vertex
                || (nd.attr.receiver_vertex = {
                type: 'ArgumentVertex',
                node: nd,
                attr: { pp: function () {
                    return 'Arg(' + astutil.ppPos(nd) + ', 0)';
                } }
            });
        } else {
            return nd.arguments[i - 1].attr.arg_vertex
                || (nd.arguments[i - 1].attr.arg_vertex = {
                type: 'ArgumentVertex',
                node: nd,
                attr: { pp: function () {
                    return 'Arg(' + astutil.ppPos(nd) + ', ' + i + ')';
                } }
            });
        }
    }

    // vertex representing result of a call
    function resVertex(nd) {
        if (nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
            throw new Error("invalid result vertex");
        return nd.attr.res_vertex
            || (nd.attr.res_vertex = {
            type: 'ResVertex',
            node: nd,
            attr: { pp: function () {
                return 'Res(' + astutil.ppPos(nd) + ')';
            } }
        });
    }

    // vertex representing some other expression
    function exprVertex(nd) {
        if (!nd.type)
            throw new Error("invalid expression vertex");
        return nd.attr.expr_vertex
            || (nd.attr.expr_vertex = {
            type: 'ExprVertex',
            node: nd,
            attr: { pp: function () {
                return 'Expr(' + astutil.ppPos(nd) + ')';
            } }
        });
    }

    exports.addIntraproceduralFlowGraphEdges = addIntraproceduralFlowGraphEdges;
    exports.funcVertex = funcVertex;
    exports.unknownVertex = unknownVertex;
    exports.globVertex = globVertex;
    exports.nativeVertex = nativeVertex;
    exports.getNativeVertices = getNativeVertices;
    exports.parmVertex = parmVertex;
    exports.argVertex = argVertex;
    exports.retVertex = retVertex;
    exports.resVertex = resVertex;
    exports.vertexFor = vertexFor;
    exports.propVertex = propVertex;
    return exports;
});
