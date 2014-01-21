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

/* Module for extracting a call graph from a flow graph. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var graph = require('./graph'),
        flowgraph = require('./flowgraph'),
        astutil = require('./astutil'),
        _ = require('./dftc');

    // extract a call graph from a flow graph by collecting all function vertices that are inversely reachable from a callee vertex
    function extractCG(ast, flow_graph) {
        var edges = new graph.Graph(),
            escaping = [], unknown = [];

        var reach = flow_graph.reachability(function (nd) {
            return nd.type !== 'UnknownVertex';
        });

        function processFuncVertex(fn) {
            var r = reach.getReachable(fn);
            r.forEach(function (nd) {
                if (nd.type === 'UnknownVertex')
                    escaping[escaping.length] = fn;
                else if (nd.type === 'CalleeVertex')
                    edges.addEdge(nd, fn);
            });
        }

        ast.attr.functions.forEach(function (fn) {
            processFuncVertex(flowgraph.funcVertex(fn));
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