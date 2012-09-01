if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var numset = require('./numset');

  function Graph() {
    this.succ = [];
  };
  
  var id2node = [];
  var nextNodeId = 1;
  function nodeId(nd) {
    var id = nd.attr.hasOwnProperty('node_id') ? nd.attr.node_id 
                                               : (nd.attr.node_id = nextNodeId++);
    id2node[+id] = nd;
    return id;
  }

  Graph.prototype.addEdge = function(from, to) {
    var fromId = nodeId(from), toId = nodeId(to);
    if(fromId === toId)
      return;
    this.succ[fromId] = numset.add(this.succ[fromId], toId);
  };
  
  Graph.prototype.addEdges = function(from, tos) {
    for(var i=0;i<tos.length;++i)
      this.addEdge(from, tos[i]);
  };
  
  Graph.prototype.invert = function() {
    var inv = new Graph();
    this.succ.forEach(function(succs, i) {
      numset.iter(succs, function(succ) {
        inv.succ[succ] = numset.add(inv.succ[succ], i);
      });
    });
    return inv;
  };
  
  Graph.prototype.iter = function(cb) {
    for(var i=0;i<this.succ.length;++i) {
      if(!this.succ[i])
        continue;
      var from = id2node[i];
      numset.iter(this.succ[i], function(succ) {
        cb(from, id2node[succ]);
      });
    }
  };

  Graph.prototype.reachability = function(nodePred) {
    var self = this;
    var tc = [];

    function computeTC(src_id) {
      if(src_id in tc)
        return tc[src_id];

      tc[src_id] = src_id;
      if(nodePred && !nodePred(id2node[src_id]))
        return tc[src_id];

      var new_tc = tc[src_id];
      numset.iter(self.succ[src_id], function(succ) {
        var succ_succ = computeTC(succ);
        new_tc = numset.addAll(new_tc, succ_succ);
      });
      return tc[src_id] = new_tc;
    }

    return {
      getReachable: function(src) {
        var src_id = nodeId(src);
        computeTC(src_id);
        return numset.map(tc[src_id], function(dest_id) { return id2node[dest_id]; });
      },
      reaches: function(src, dest) {
        var src_id = nodeId(src), dest_id = nodeId(dest);
        computeTC(src_id);
        return numset.some(tc[src_id], function(id) { return id === dest_id; });
      }
    };
  };
  
  exports.Graph = Graph;
  return exports;
});