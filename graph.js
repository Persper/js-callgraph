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

  /**
   * Insert number x into sorted array a, and return the modified a.
   */
  function insert(a, x) {
      var lo = 0, hi = a.length-1, mid, elt;
      while(lo <= hi) {
        mid = (lo+hi) >> 1;
        elt = a[mid];
        if(elt < x) {
          lo = mid+1;
        } else if(elt > x) {
          hi = mid-1;
        } else {
          return a;
        }
      }
      a.splice(lo, 0, x);
      return a;
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
      insert(succ, toId);
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

  /**
   * Merge sorted arrays a and b and return the result, which is either the
   * modified array a, or a newly allocated array; b is never modified.
   * Both a and b may be singleton numbers instead of arrays.
   */
  function merge(a, b) {
    if(typeof a === 'number') {
      if(typeof b === 'number') {
        if(a < b)
          return [a, b];
        else if(a > b)
          return [b, a];
        return a;
      } else {
        return insert(b.slice(0), a);
      }
    }

    // 'a' must be an array; check 'b'
    var l1 = a.length;
    if(l1 === 0)
      return b;

    if(typeof b === 'number') {
      return insert(a, b);
    } else {
      var l2 = b.length;
      if(l2 === 0)
        return a;

      var res = new Array(l1+l2);
      var i = 0, j = 0, k = 0;
      while(i < l1 || j < l2) {
        while(i < l1 && (j >= l2 || a[i] <= b[j]))
          res[k++] = a[i++];
        while(k > 0 && j < l2 && b[j] === res[k-1])
          ++j;
        while(j < l2 && (i >= l1 || b[j] < a[i]))
          res[k++] = b[j++];
      }
      res.length = k;
      return res;
    }
  }

  Graph.prototype.reachability = function(nodePred) {
    var self = this;
    var tc = [];

    function computeTC(src_id) {
      if(src_id in tc)
        return tc[src_id];

      tc[src_id] = src_id;
      if(nodePred && !nodePred(id2node[src_id]))
        return tc[src_id];

      var succ = self.succ[src_id];
      var new_tc = tc[src_id];
      if(typeof succ === 'number') {
        var succ_succ = computeTC(succ);
        new_tc = merge(new_tc, succ_succ);
      } else if(succ && typeof succ === 'object') {
        for(var i=0;i<succ.length;++i) {
          var succ_succ = computeTC(succ[i]);
          new_tc = merge(new_tc, succ_succ);
        }
      }
      return tc[src_id] = new_tc;
    }

    return {
      getReachable: function(src) {
        var src_id = nodeId(src);
        computeTC(src_id);
        var reachable = tc[src_id];
        if(typeof reachable === 'number')
          return [id2node[reachable]];
        return reachable.map(function(dest_id) { return id2node[dest_id]; });
      },
      reaches: function(src, dest) {
        var src_id = nodeId(src), dest_id = nodeId(dest);
        computeTC(src_id);
        var reachable = tc[src_id];
        if(typeof reachable === 'number')
          return reachable === dest_id;
        for(var i=0;i<reachable.length;++i)
          if(reachable[i] === dest_id)
            return true;
        return false;
      }
    };
  };
  
  exports.Graph = Graph;
  return exports;
});