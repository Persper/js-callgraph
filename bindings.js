if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var astutil = require('./astutil'),
      symtab = require('./symtab');
  
  function addBindings(ast) {
    var global_scope = new symtab.Symtab();
    var scope = global_scope;
    var decl_scope = null;
    astutil.visit(ast,
    function enter(nd, visit) {
      switch(nd.type) {
      case 'FunctionDeclaration':
        if(decl_scope)
          decl_scope.set(nd.id.name, nd.id);
        // FALL THROUGH
      case 'FunctionExpression':
        var old_decl_scope = decl_scope;
        scope = decl_scope = new symtab.Symtab(scope);
        
        nd.attr.scope = scope;
        if(nd.type === 'FunctionExpression' && nd.id)
          decl_scope.set(nd.id.name, nd.id);
        decl_scope.set('this', { type: 'Identifier',
                                 name: 'this',
                                 loc: nd.loc,
                                 range: nd.range,
                                 attr: {} });
        for(var i=0;i<nd.params.length;++i)
          decl_scope.set(nd.params[i].name, nd.params[i]);
        
        // don't visit function name and parameters, just the body
        visit(nd.body);
        
        // restore previous scope
        if(!decl_scope.has('arguments'))
          decl_scope.set('arguments', { type: 'Identifier',
                                        name: 'arguments',
                                        loc: nd.loc,
                                        range: nd.range,
                                        attr: {} });
        scope = scope.outer;
        decl_scope = old_decl_scope;
        
        return false;
        
      case 'CatchClause':
        scope = new symtab.Symtab(scope);
        
        // don't visit the parameter
        visit(nd.body);
        
        scope = scope.outer;
        return false;
        
      case 'Identifier':
      case 'ThisExpression':
        nd.attr.scope = decl_scope || global_scope;
        break;
        
      case 'MemberExpression':
        visit(nd.object);
        if(nd.computed)
          visit(nd.property);
        return false;
        
      case 'VariableDeclarator':
        if(decl_scope)
          decl_scope.set(nd.id.name, nd.id);
        visit(nd.id);
        visit(nd.init);
        return false;
        
      case 'Property':
        // don't visit nd.key
        visit(nd.value);
        return false;
      }
    });
  }
  
  exports.addBindings = addBindings;
  return exports;
});