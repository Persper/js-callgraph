/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Max Schaefer - initial API and implementation
 *******************************************************************************/

/* Optimistic call graph builder that tries to be clever about
 * which interprocedural flows to propagate: it only propagates
 * along edges that lead to a function call. */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var graph = require('./graph'),
        natives = require('./natives'),
        flowgraph = require('./flowgraph'),
        callgraph = require('./callgraph'),
        astutil = require('./astutil'),
        path = require('path');

    /* Arguments:
               nd - an ast node

       Return value: true if nd represents an assignment to module.exports
                     false otherwise */
    function isModuleExports(nd) {
        if (nd.type !== 'AssignmentExpression')
            return false;

        left = nd.left;

        if (left.type !== 'MemberExpression')
            return  false;

        object = left.object;
        property = left.property;

        if (object.type !== 'Identifier' || property.type !== 'Identifier')
            return false;

        return object.name === 'module' && property.name === 'exports';
    }

    /* Arguments:
               nd - an ast node
          fn_name - a function name to compare to

      Return value: true if nd represents a call to fn_name
                    false otherwise */
    function isCallTo(nd, fn_name) {
      if (nd.type !== 'CallExpression')
        return false;

      callee = nd.callee;

      if (callee.type !== 'Identifier')
        return false;

      return callee.name === fn_name
    }

    /* Arguments:
               fn - an ast node representing a FunctionDeclaration

       Return value: a list containing all of the ReturnStatement
                     nodes' values in fn's body */
    function getReturnValues(fn) {
      fn_body = fn.body.body;
      lst = [];

      for (var i = 0; i < fn_body.length; i++)
        if (fn_body[i].type === 'ReturnStatement')
          lst.push(fn_body[i].argument);

      return lst;
    }

    /* Arguments:
          exp_fns - a dictionary with filenames as keys
                    and a list of exported values as values
         filename - a filename
               nd - a node in an ast

       Postcondition: nd has been paired with filename in exp_fns */
    function addExport(exp_fns, filename, nd) {
      if (filename in exp_fns)
        exp_fns[filename] = exp_fns[filename] + [nd];
      else
        exp_fns[filename] = [nd];
    }

    /* Arguments: ast - a ProgramCollection
       Return value: dictionary with filenames as keys
                     and a list of exported values as values */
    function collectExports(ast) {
      exported_functions = {};

      for (var i = 0; i < ast.programs.length; i++) {
        filename = ast.programs[i].attr.filename;
        filename = path.resolve(filename);

        astutil.visit(ast.programs[i], function (nd) {
          /* Handles: module.exports = fn */
          if (isModuleExports(nd)) {
            addExport(exported_functions, filename, nd.right);
          }
          /* Handles: define(function() {return fn;}) */
          if (isCallTo(nd, 'define')) {
            ret_vals = getReturnValues(nd.arguments[0]);

            for (var i = 0; i < ret_vals.length; i++)
                addExport(exported_functions, filename, ret_vals[i]);
          }
        })
      }
      return exported_functions;
    }

    /* Arguments:
         curr_filename - full path of the file calling require
                    nd - ast node representing call to require

       Return value: full path of file being required */
    function getRequiredFile(curr_filename, nd) {
      argument = nd.arguments[0].value;
      required_file = argument.slice(2);
      required_file = path.resolve(curr_filename, '..', required_file);
      required_file = required_file + '.js';

      return required_file
    }

    /* Arguments:
              ast - a ProgramCollection
               fg - a flowgraph
          exp_fns - a dictionary with filenames as keys
                    and a list of exported values as values

       Postcondition: edges connecting imports to the corresponding
                      exported value have been added to the flowgraph */
    function connectImports(ast, fg, exp_fns) {
      for (var i = 0; i < ast.programs.length; i++) {
        filename = ast.programs[i].attr.filename;

        astutil.visit(ast.programs[i], function (nd) {
          if (nd.type === 'VariableDeclarator') {
            init = nd.init;

            if (isCallTo(init, 'require')) {
              required_file = getRequiredFile(filename, init);
              if (required_file in exp_fns)
                 fg.addEdge(flowgraph.vertexFor(exp_fns[required_file][0]), flowgraph.vertexFor(nd.id));
            }
          }
        })
      }
    }

    function addInterproceduralFlowEdges(ast, fg) {
        fg = fg || new graph.Graph();

        var changed;
        do {
            changed = false;

            var reach = fg.reachability(function (nd) {
                return nd.type !== 'UnknownVertex';
            });

            ast.attr.calls.forEach(function (call) {
                var res = flowgraph.resVertex(call);
                if (!res.attr.interesting)
                    reach.iterReachable(res, function (nd) {
                        if (nd.type === 'CalleeVertex') {
                            res.attr.interesting = true;
                        }
                    });
            });

            ast.attr.functions.forEach(function (fn) {
                var interesting = false, nparams = fn.params.length;

                for (var i = 0; i <= nparams; ++i) {
                    var param = flowgraph.parmVertex(fn, i);
                    if (!param.attr.interesting) {
                        reach.iterReachable(param, function (nd) {
                            if (nd.type === 'CalleeVertex') {
                                param.attr.interesting = true;
                            }
                        });
                    }
                    interesting = interesting || param.attr.interesting;
                }

                reach.iterReachable(flowgraph.funcVertex(fn), function (nd) {
                    if (nd.type === 'CalleeVertex') {
                        var call = nd.call, res = flowgraph.resVertex(call);

                        if (res.attr.interesting) {
                            var ret = flowgraph.retVertex(fn);
                            if (!fg.hasEdge(ret, res)) {
                                changed = true;
                                fg.addEdge(ret, res);
                            }
                        }

                        if (interesting)
                            for (var i = 0; i <= nparams; ++i) {
                                if (i > call.arguments.length)
                                    break;

                                var param = flowgraph.parmVertex(fn, i);
                                if (param.attr.interesting) {
                                    var arg = flowgraph.argVertex(call, i);
                                    if (!fg.hasEdge(arg, param)) {
                                        changed = true;
                                        fg.addEdge(arg, param);
                                    }
                                }
                            }
                    }
                });
            });
        } while (changed); // until fixpoint

        return fg;
    }

    function buildCallGraph(ast) {
        var fg = new graph.Graph();
        natives.addNativeFlowEdges(fg);

        flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);

        exported_functions = collectExports(ast);
        connectImports(ast, fg, exported_functions);

        addInterproceduralFlowEdges(ast, fg);

        return callgraph.extractCG(ast, fg);
    }

    exports.addInterproceduralFlowEdges = addInterproceduralFlowEdges;
    exports.buildCallGraph = buildCallGraph;
    return exports;
});
