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
        callgraph = require('./callgraph');

    function buildCallGraph(ast) {
        var fg = new graph.Graph();
        natives.addNativeFlowEdges(fg);
        flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);

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
                            //console.log(res.attr.pp() + " is interesting");
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

        return callgraph.extractCG(ast, fg);
    }

    exports.buildCallGraph = buildCallGraph;
    return exports;
});