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
      if(succ !== toId)
        succ = [succ, toId];
    } else {
      if(succ.indexOf(toId) === -1)
        succ[succ.length] = toId;
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
  
  exports.Graph = Graph;
  return exports;
});