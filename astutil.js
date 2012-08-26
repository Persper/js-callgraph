if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var internalPropRegExp = /range|loc|attr|comments|raw/;
  function visit(root, visitor) {
    function doVisit(nd) {
      if(!nd || typeof nd !== 'object')
        return;
      
      if(nd.type) {
        var res = visitor(nd, doVisit);
        if(res === false)
          return;
      }
      
      for(var p in nd) {
        if(!nd.hasOwnProperty(p) || p.match(internalPropRegExp))
          continue;
        doVisit(nd[p]);
      }
    }
    
    doVisit(root);
  }
  
  function init(ast) {
    var enclosingFunction = null;
    visit(ast, function(nd, visit) {
      if(nd.type && !nd.attr)
        nd.attr = {};
      
      if(enclosingFunction)
        nd.attr.enclosingFunction = enclosingFunction;
      
      if(nd.type === 'FunctionDeclaration' || nd.type === 'FunctionExpression') {
        var old_enclosingFunction = enclosingFunction;
        enclosingFunction = nd;
        visit(nd.id);
        visit(nd.params);
        visit(nd.body);
        enclosingFunction = old_enclosingFunction;
        return false;
      }
    });
  }
  
  function ppPos(nd) {
    return nd.loc.start.line + ":" + nd.range[0] + "-" + nd.range[1];
  }
  
  exports.visit = visit;
  exports.init = init;
  exports.ppPos = ppPos;
  return exports;
});