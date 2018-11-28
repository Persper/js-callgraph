/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/* Module for extracting a call graph from a flow graph. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var graph = require('./graph'),
        dftc = require('./dftc.js'),
        flowgraph = require('./flowgraph');

    // extract a call graph from a flow graph by collecting all function vertices that are inversely reachable from a callee vertex
    function extractCG(ast, flow_graph) {
        var edges = new graph.Graph(),
            escaping = [], unknown = [];

        var reach = dftc.reachability(flow_graph, function (nd) {
            return nd.type !== 'UnknownVertex';
        });

        /* fn is a flow graph node of type 'FuncVertex' */
        function processFuncVertex(fn) {
            var r = reach.getReachable(fn);
            r.forEach(function (nd) {
                if (nd.type === 'UnknownVertex')
                    escaping[escaping.length] = fn;
                else if (nd.type === 'CalleeVertex')
                    edges.addEdge(nd, fn);
            });
        }

        /*
        ast.attr.functions.forEach(function (fn) {
            processFuncVertex(flowgraph.funcVertex(fn));
        });
        */

        flow_graph.iterNodes(function (nd) {
            if (nd.type === 'FuncVertex'){
                processFuncVertex(nd);
            }
        });

        flowgraph.getNativeVertices().forEach(processFuncVertex);

        var unknown_r = reach.getReachable(flowgraph.unknownVertex());
        unknown_r.forEach(function (nd) {
            if (nd.type === 'CalleeVertex')
                unknown[unknown.length] = nd;
        });

        return {
            edges: edges,
            escaping: escaping,
            unknown: unknown,
            fg: flow_graph
        };
    }

    exports.extractCG = extractCG;
    return exports;
});
