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
        this.pred = [];
    }

    var id2node = Graph.prototype.id2node = [];
    var nextNodeId = 1;
    var nodeId = Graph.prototype.nodeId = function nodeId(nd) {
        var id = nd.attr.hasOwnProperty('node_id') ? nd.attr.node_id
            : (nd.attr.node_id = nextNodeId++);
        id2node[+id] = nd;
        return id;
    };

    /* Adds the node to the graph if not already there */
    Graph.prototype.addNode = function (nd) {
      if (this.hasNode(nd))
          return;

      nd.attr.node_id = nextNodeId++;
      id2node[nd.attr.node_id] = nd;
    }

    Graph.prototype.addEdge = function (from, to) {
        var fromId = nodeId(from), toId = nodeId(to);
        if (fromId === toId)
            return;
        this.succ[fromId] = numset.add(this.succ[fromId], toId);
        this.pred[toId] = numset.add(this.pred[toId], fromId);
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
        if (!this.hasNode(from) || !this.hasNode(to))
          return false;

        var fromId = nodeId(from), toId = nodeId(to);
        return numset.contains(this.succ[fromId], toId);
    };

    /* Only call this function if nd already in the graph */
    function getId (nd) {
        return nd.attr.node_id;
    }

    Graph.prototype.hasNode = function (nd) {
        return nd.attr.hasOwnProperty('node_id');
    }

    /* Remove (from , to), return false if edge doesn't exist */
    Graph.prototype.removeEdge = function (from, to) {
        if (this.hasNode(from) && this.hasNode(to) && this.hasEdge(from, to)){
            const fromId = getId(from), toId = getId(to);
            this.succ[fromId] = numset.remove(this.succ[fromId], toId);
            this.pred[toId] = numset.remove(this.pred[toId], fromId);
            return true;
        }
        return false;
    };

    /* Remove all outward edges of a node */
    Graph.prototype.removeOutEdges = function (nd) {
        if (this.hasNode(nd)){
            const nid = getId(nd);
            // Remove itself from other nodes' pred sets
            let cb = function (succ) {
                this.pred[succ] = numset.remove(this.pred[succ], nid);
            };
            numset.iter(this.succ[nid], cb.bind(this));
            // Empty its own succ set
            this.succ[nid] = undefined;
            return true;
        }
        return false;
    }

    /* Remove all inward edges of a node */
    Graph.prototype.removeInEdges = function (nd) {
        if (this.hasNode(nd)){
            const nid = getId(nd);
            // Remove itself from other nodes' succ sets
            let cb = function (pred) {
                this.succ[pred] = numset.remove(this.succ[pred], nid);
            };
            numset.iter(this.pred[nid], cb.bind(this));
            // Empty its own pred set
            this.pred[nid] = undefined;
            return true;
        }
        return false;
    }

    /* Remove a node and all associated edges from graph */
    Graph.prototype.removeNode = function (nd) {
        if (this.hasNode(nd)) {
            this.removeInEdges(nd);
            this.removeOutEdges(nd);
            this.id2node[getId(nd)] = null;
            delete nd.attr.node_id;
            return true;
        }
        return false;
    }

    Graph.prototype.iterNodes = function (cb) {
        for (let i = 0; i < this.id2node.length; ++i) {
            if (this.id2node[i])
                cb(this.id2node[i]);
        }
    }

    exports.Graph = Graph;
    return exports;
});
