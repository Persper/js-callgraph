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

/* Graphs represented using adjacency sets. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var numset = require('./numset');

    function Graph() {
        this.succ = [];
    }

    var id2node = Graph.prototype.id2node = [];
    var nextNodeId = 1;
    var nodeId = Graph.prototype.nodeId = function nodeId(nd) {
        var id = nd.attr.hasOwnProperty('node_id') ? nd.attr.node_id
            : (nd.attr.node_id = nextNodeId++);
        id2node[+id] = nd;
        return id;
    };

    Graph.prototype.addEdge = function (from, to) {
        var fromId = nodeId(from), toId = nodeId(to);
        if (fromId === toId)
            return;
        this.succ[fromId] = numset.add(this.succ[fromId], toId);
    };

    Graph.prototype.addEdges = function (from, tos) {
        for (var i = 0; i < tos.length; ++i)
            this.addEdge(from, tos[i]);
    };

    Graph.prototype.iter = function (cb) {
        for (var i = 0; i < this.succ.length; ++i) {
            if (!this.succ[i])
                continue;
            var from = id2node[i];
            numset.iter(this.succ[i], function (succ) {
                cb(from, id2node[succ]);
            });
        }
    };

    Graph.prototype.hasEdge = function (from, to) {
        var fromId = nodeId(from), toId = nodeId(to);
        return numset.contains(this.succ[fromId], toId);
    };

    exports.Graph = Graph;
    return exports;
});