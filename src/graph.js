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
    var graph = require("graph-data-structure");
    var astutil = require('./astutil');
    var numset = require('./numset');

    function nodeToString(nd) {
      return nd.attr.pp();
    }

    var cf = nodeToString;

    function Graph() {
        this.graph = new graph();
        this.node_pairings = {};
        this.edge_annotations = {};
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

    Graph.prototype.update = function (old_cf, new_nd) {
      if (!(old_cf in this.node_pairings) || cf(new_nd) == old_cf)
        return;

      this.node_pairings[cf(new_nd)] = new_nd;
      delete this.node_pairings[old_cf];

      this.graph.addNode(cf(new_nd));

      let gs = this.graph.serialize();

      for (let i = 0; i < gs['links'].length; i++) {
        if (gs['links'][i]['source'] == old_cf)
          this.graph.addEdge(cf(new_nd), gs['links'][i]['target']);

        if (gs['links'][i]['target'] == old_cf)
          this.graph.addEdge(gs['links'][i]['source'], cf(new_nd));
      }
      this.graph.removeNode(old_cf);
    }

    Graph.prototype.merge = function (graph) {
      let nodes = graph.getNodes();

      for (let i = 0; i < nodes.length; i++) {
        this.addNode(nodes[i]);
      }

      let gs = graph.serialize();

      for (let i = 0; i < gs['links'].length; i++) {
        this.graph.addEdge(gs['links'][i]['source'], gs['links'][i]['target'])
      }
    }

    Graph.prototype.iter = function (cb) {
        let edges = this.graph.serialize()['links'];

        for (let i = 0; i < edges.length; i++) {
          let from = edges[i]['source'];
          let to = edges[i]['target'];

          let from_nd = this.node_pairings[from];
          let to_nd = this.node_pairings[to];

          cb(from_nd, to_nd);

          this.update(from, from_nd);
          this.update(to, to_nd);
        }
    };

    Graph.prototype.hasEdge = function (from, to) {
        return this.graph.adjacent(cf(from)).indexOf(cf(to)) >= 0;
    };

    /* Only call this function if nd already in the graph */
    function getId (nd) {
        return nd.attr.node_id;
    }

    Graph.prototype.succ = function (nd) {
      let adj = this.graph.adjacent(cf(nd));

      let lst = [];

      for (let i = 0; i < adj.length; i++)
        lst.push(this.node_pairings[adj[i]])

      return lst
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

    /* Remove all outward edges of a node */
    Graph.prototype.removeOutEdges = function (nd) {
        if (this.hasNode(nd)){
            let adjacency = this.graph.adjacent(cf(nd));

            for (let i = 0; i < adjacency.length; i++) {
              this.graph.removeEdge(cf(nd), adjacency[i]);
            }
            return true;
        }
        return false;
    }

    /* Remove all inward edges of a node */
    Graph.prototype.removeInEdges = function (nd) {
        if (this.hasNode(nd)){
            let gs = this.graph.serialize();

            for (let i = 0; i < gs['links'].length; i++) {
              if (gs['links'][i]['target'] == cf(nd))
                this.graph.removeEdge(gs['links'][i]['source'], cf(nd));
            }
            return true;
        }
        return false;
    }

    /* Remove a node and all associated edges from graph */
    Graph.prototype.removeNode = function (nd) {
        if (this.hasNode(nd)) {
            this.graph.removeNode(cf(nd));
            delete this.node_pairings[cf(nd)];
            return true;
        }
        return false;
    }

    Graph.prototype.iterNodes = function (cb) {
        let nodes = this.graph.nodes();
        for (let i = 0; i < nodes.length; i++) {
          let cfn = nodes[i];
          let n = this.node_pairings[cfn];
          cb(n);
          this.update(cfn, n);
        }
    }

    Graph.prototype.getNodes = function() {
      let str_nodes = this.graph.nodes();
      let nodes = [];
      for (let i = 0; i < str_nodes.length; i++)
        nodes.push(this.node_pairings[str_nodes[i]]);

      return nodes;
    }

    exports.Graph = Graph;
    exports.nd2str = nodeToString;
    return exports;
});
