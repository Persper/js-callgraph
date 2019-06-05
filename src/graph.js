/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

 /* Graphs represented using adjacency sets. */
 if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    const { LinkedList } = require('./linkedList');

    class BasicGraph {
        constructor() {
           this._pred = {};
           this._succ = {};
        }

        addNode(node) {
            this._pred[node] = this.pred(node);
            this._succ[node] = this.succ(node);
        }

        // Remove all associated edges
        // Does nothing if the node doesn not exist
        removeNode(node) {
            if (this._pred[node]) {
                for (let p of this._pred[node]) {
                    this._succ[p].remove(node);
                }
                delete this._pred[node];
            }
            if (this._succ[node]) {
                for (let s of this._succ[node]) {
                    this._pred[s].remove(node);
                }
                delete this._succ[node];
            }
        }

        pred(node) {
           return this._pred[node] || new LinkedList();
        }

        succ(node) {
            return this._succ[node] || new LinkedList();
        }

        addEdge(u, v) {
            this.addNode(u);
            this.addNode(v);
            this._succ[u].add(v);
            this._pred[v].add(u);
        }

        // Does not remove the nodes
        // Does nothing if the edge does not exist
        removeEdge(u, v) {
            if (this._succ[u]) {
                this._succ[u].remove(v);
            }
            if (this._pred[v]) {
                this._pred[v].remove(u);
            }
        }

        nodes() {
            return Object.keys(this._pred);
        }

        serialize() {
            let serialized = {
                nodes: this.nodes().map((id) => {
                    return {id: id};
                }),
                links: []
            }

            serialized.nodes.forEach((node) => {
                let source = node.id;
                for (let target of this._succ[source]) {
                    serialized.links.push({
                        source: source,
                        target: target
                    });
                }
            });
            return serialized;
        }
    }

    function nodeToString(nd) {
        return nd.attr.pp();
    }

    var cf = nodeToString;

    function Graph() {
        this.graph = new BasicGraph();
        this.node_pairings = {};
        this.edge_annotations = {};
    }

    /* Adds the node to the graph if not already there */
    Graph.prototype.addNode = function (nd) {
        if (this.hasNode(nd))
            return;

        this.node_pairings[cf(nd)] = nd;
        this.graph.addNode(cf(nd));
    }

    Graph.prototype.addEdge = function (from, to, annote) {
        this.addNode(from);
        this.addNode(to);

        this.graph.addEdge(cf(from), cf(to));

        if (annote !== undefined)
            this.edge_annotations[cf(from) + ' -> ' + cf(to)] = annote;
    };

    Graph.prototype.addEdges = function (from, tos, annotations) {
        for (var i = 0; i < tos.length; ++i)
            if (annotations !== undefined)
                this.addEdge(from, tos[i], annotations[i]);
            else
                this.addEdge(from, tos[i]);
    };

    Graph.prototype.iter = function (cb) {
        const nodes = this.graph.nodes();
        for (let u of nodes) {
            for (let v of this.graph.succ(u)) {
                let u_nd = this.node_pairings[u];
                let v_nd = this.node_pairings[v];
                cb(u_nd, v_nd);
            }
        }
    };

    Graph.prototype.hasEdge = function (from, to) {
        return this.graph.succ(cf(from)).has(cf(to));
    };

    Graph.prototype.succ = function (nd) {
        let succ = this.graph.succ(cf(nd));
        let lst = [];
        for (let s of succ)
            lst.push(this.node_pairings[s])
        return lst;
    }

    Graph.prototype.hasNode = function (nd) {
        return cf(nd) in this.node_pairings;
    }

    /* Remove (from , to), return false if edge doesn't exist */
    Graph.prototype.removeEdge = function (from, to) {
        if (this.hasNode(from) && this.hasNode(to) && this.hasEdge(from, to)){
            this.graph.removeEdge(cf(from), cf(to))
            return true;
        }
        return false;
    };

    /* Remove a node and all associated edges from graph */
    Graph.prototype.removeNode = function (nd) {
        if (this.hasNode(nd)) {
            this.graph.removeNode(cf(nd));
            delete this.node_pairings[cf(nd)];
            return true;
        }
        return false;
    };

    Graph.prototype.iterNodes = function (cb) {
        let nodes = this.graph.nodes();
        for (let i = 0; i < nodes.length; i++) {
            let cfn = nodes[i];
            let n = this.node_pairings[cfn];
            cb(n);
        }
    };

    Graph.prototype.getNodes = function() {
        let str_nodes = this.graph.nodes();
        let nodes = [];
        for (let i = 0; i < str_nodes.length; i++)
            nodes.push(this.node_pairings[str_nodes[i]]);

        return nodes;
    };

    /* Get enclosingFile of a node in flow graph by querying its associated AST node */
    function getEnclosingFile (nd) {
        if (nd.hasOwnProperty('node')) {
            return nd.node.attr.enclosingFile;
        } else if (nd.hasOwnProperty('call')) {
            return nd.call.attr.enclosingFile;
        } else if (nd.hasOwnProperty('func')) {
            return nd.func.attr.enclosingFile;
        } else {
            // Native, Prop and Unknown vertices
            return null;
        }
    }

    class FlowGraph extends Graph {
        constructor() {
            super();
            this._fileToNodes = {};
        }

        addEdge(from, to, annote) {
            super.addEdge(from, to, annote);
            this._updateFileToNodes(from);
            this._updateFileToNodes(to);
        }

        _updateFileToNodes(fgNode) {
            const enclosingFile = getEnclosingFile(fgNode);
            if (enclosingFile === null)
                return;
            if (!(enclosingFile in this._fileToNodes))
                this._fileToNodes[enclosingFile] = new Set();
            this._fileToNodes[enclosingFile].add(fgNode);
        }

        removeNodesInFile(fileName) {
            if (fileName in this._fileToNodes) {
                for (let fgNode of this._fileToNodes[fileName]) {
                    super.removeNode(fgNode);
                }
            }
            else {
                console.log("WARNING: fileName doesn't exist in _fileToNodes.");
            }
        }
    }


    exports.Graph = Graph;
    exports.FlowGraph = FlowGraph;
    exports.nd2str = nodeToString;
    return exports;
});
