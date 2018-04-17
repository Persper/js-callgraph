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

/* Module for adding standard library/DOM modelling to flow graph. */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var flowgraph = require('./flowgraph'),
        nativeFlows = require('./harness').nativeFlows;

    function addNativeFlowEdges(flow_graph) {
        for (var native in nativeFlows) {
            if (!nativeFlows.hasOwnProperty(native))
                continue;
            var target = nativeFlows[native];
            flow_graph.addEdge(flowgraph.nativeVertex(native), flowgraph.propVertex({ type: 'Identifier',
                name: target }));
        }
        return flow_graph;
    }

    exports.addNativeFlowEdges = addNativeFlowEdges;
    return exports;
});