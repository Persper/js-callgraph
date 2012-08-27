if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  function Graph() {
    this.succ = [];
  };
  
  var id2node = [];
  var nextNodeId = 1;
  function nodeId(nd) {
    var id = nd.attr.hasOwnProperty('node_id') ? nd.attr.node_id 
                                               : (nd.attr.node_id = nextNodeId++);
    id2node[id] = nd;
    return id;
  }
  
  function addSucc(succ, toId) {
    if(typeof succ === 'undefined') {
      succ = toId;
    } else if(typeof succ === 'number') {
      if(succ < toId)
        succ = [succ, toId];
      else if(succ > toId)
        succ = [toId, succ];
    } else {
      var lo = 0, hi = succ.length-1, mid, elt;
      while(lo <= hi) {
        mid = (lo+hi) >> 1;
        elt = succ[mid];
        if(elt < toId) {
          lo = mid+1;
        } else if(elt > toId) {
          hi = mid-1;
        } else {
          return succ;
        }
      }
      succ.splice(lo, 0, toId);
    }    
    return succ;
  }
  
  Graph.prototype.addEdge = function(from, to) {
    var fromId = nodeId(from), toId = nodeId(to);
    if(fromId === toId)
      return;
    this.succ[fromId] = addSucc(this.succ[fromId], toId);
  };
  
  Graph.prototype.addEdges = function(from, tos) {
    for(var i=0;i<tos.length;++i)
      this.addEdge(from, tos[i]);
  };
  
  Graph.prototype.invert = function() {
    var inv = new Graph();
    for(var i=0;i<this.succ.length;++i) {
      if(!this.succ[i])
        continue;
      var succ = this.succ[i];
      if(typeof succ === 'number')
        inv.succ[succ] = addSucc(inv.succ[succ], i);
      else
        for(var j=0;j<succ.length;++j)
          inv.succ[succ[j]] = addSucc(inv.succ[succ[j]], i);
    }
    return inv;
  };
  
  Graph.prototype.iter = function(cb) {
    for(var i=0;i<this.succ.length;++i) {
      if(!this.succ[i])
        continue;
      var from = id2node[i];
      var succ = this.succ[i];
      if(typeof succ === 'number')
        cb(from, id2node[succ]);
      else
        for(var j=0;j<succ.length;++j)
          cb(from, id2node[succ[j]]);
    }
  };

  Graph.prototype.reachability = function(nodePred) {
    var self = this;
    var tc = [];

    function computeTC(src_id) {
      if(src_id in tc)
        return tc[src_id];

      tc[src_id] = [src_id];
      if(nodePred && !nodePred(id2node[src_id]))
        return tc[src_id];

      var succ = self.succ[src_id];
      if(typeof succ === 'number') {
        var succ_succ = computeTC(succ);
        for(var j=0;j<succ_succ.length;++j)
          if(tc[src_id].indexOf(succ_succ[j]) === -1)
            tc[src_id].push(succ_succ[j]);
      } else if(succ && typeof succ === 'object') {
        for(var i=0;i<succ.length;++i) {
          var succ_succ = computeTC(succ[i]);
          for(var j=0;j<succ_succ.length;++j)
            if(tc[src_id].indexOf(succ_succ[j]) === -1)
              tc[src_id].push(succ_succ[j]);
        }
      }
      return tc[src_id];
    }

    return {
      getReachable: function(src) {
        var src_id = nodeId(src);
        computeTC(src_id);
        return tc[src_id].map(function(dest_id) { return id2node[dest_id]; });
      },
      reaches: function(src, dest) {
        var src_id = nodeId(src), dest_id = nodeId(dest);
        computeTC(src_id);
        for(var i=0;i<tc[src_id].length;++i)
          if(tc[src_id][i] === dest_id)
            return true;
        return false;
      }
    };
  };
  
  exports.Graph = Graph;
  return exports;
});