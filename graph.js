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

  Graph.prototype.hasEdge = function(from, to) {
    var fromId = nodeId(from), toId = nodeId(to);
    return numset.contains(this.succ[fromId], toId);    
  }

  Graph.prototype.reachability = function(nodePred) {
    var self = this;
    var tc = [], touched = [];

    function computeTC(src_id) {
      if(src_id in tc) {
        touched[src_id] = true;
        return tc[src_id];
      }

      tc[src_id] = src_id;
      if(nodePred && !nodePred(id2node[src_id]))
        return tc[src_id];

      do {
        var oldsz = numset.size(tc[src_id]);
        touched[src_id] = false;
        numset.iter(self.succ[src_id], function(succ) {
          tc[src_id] = numset.addAll(tc[src_id], computeTC(succ));
        });
      } while(oldsz < numset.size(tc[src_id]) && touched[src_id]);
      return tc[src_id];
    }

    return {
      getReachable: function(src) {
        var src_id = nodeId(src);
        computeTC(src_id);
        return numset.map(tc[src_id], function(dest_id) { return id2node[dest_id]; });
      },
      iterReachable: function(src, cb) {
        var src_id = nodeId(src);
        computeTC(src_id);
        numset.iter(tc[src_id], function(dest_id) { cb(id2node[dest_id]); });
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