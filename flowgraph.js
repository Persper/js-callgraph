/**
 * This module defines the machinery for extracting a flow graph from an AST.
 */

if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var astutil = require('./astutil'),
      graph = require('./graph'),
      symtab = require('./symtab');

  function buildOneShotCallGraph(ast, flow_graph) {
    flow_graph = flow_graph || new graph.Graph();
    astutil.visit(ast, function(nd, visit) {
      switch(nd.type) {
      case 'CallExpression':
      case 'NewExpression':
        var callee = nd.callee;
        if(callee.type === 'FunctionExpression') {
          // one-shot call
          for(var i=0;i<nd.arguments.length;++i) {
            if(i >= callee.params.length)
              break;
            flow_graph.addEdge(argVertex(nd, i+1), parmVertex(callee, i+1));
          }
          flow_graph.addEdge(retVertex(callee), resVertex(nd));
          visit(callee.body);
          return false;
        } else {
          // not a one-shot call
          for(var i=0;i<=nd.arguments.length;++i)
            flow_graph.addEdge(argVertex(nd, i), unknownVertex());
          flow_graph.addEdge(unknownVertex(), resVertex(nd));
        }
        break;
      case 'FunctionExpression':
      case 'FunctionDeclaration':
        // not a one-shot closure
        for(var i=0;i<=nd.params.length;++i)
          flow_graph.addEdge(unknownVertex(), parmVertex(nd, i));
        flow_graph.addEdge(retVertex(nd), unknownVertex());
        break;
      }
    });
    return flow_graph;
  }

  function addIntraproceduralFlowGraphEdges(ast, flow_graph) {
    flow_graph = flow_graph || new graph.Graph();
    astutil.visit(ast, function(nd) {
      switch(nd.type) {
      case 'ArrayExpression':
        for(var i=0;i<nd.elements.length;++i)
          if(nd.elements[i])
            flow_graph.addEdge(vertexFor(nd.elements[i]), propVertex({ type: 'Literal',
                                                                       value: i }));
        break;
      case 'AssignmentExpression':
        if(nd.operator === '=')
          flow_graph.addEdges(vertexFor(nd.right), [vertexFor(nd.left), vertexFor(nd)]);
        break;
      case 'CallExpression':
        if(nd.callee.type === 'MemberExpression')
          flow_graph.addEdge(vertexFor(nd.callee.object), argVertex(nd, 0));
        // FALL THROUGH
      case 'NewExpression':
        flow_graph.addEdge(vertexFor(nd.callee), calleeVertex(nd));
        for(var i=0;i<nd.arguments.length;++i)
          flow_graph.addEdge(vertexFor(nd.arguments[i]), argVertex(nd, i+1));
        flow_graph.addEdge(resVertex(nd), vertexFor(nd));
        break;
      case 'CatchClause':
        flow_graph.addEdge(unknownVertex(), varVertex(nd.param));
        break;
      case 'ConditionalExpression':
        flow_graph.addEdge(vertexFor(nd.consequent), vertexFor(nd));
        flow_graph.addEdge(vertexFor(nd.alternate), vertexFor(nd));
        break;
      case 'FunctionDeclaration':
        flow_graph.addEdge(funcVertex(nd), varVertex(nd.id));
        break;
      case 'FunctionExpression':
        flow_graph.addEdge(funcVertex(nd), exprVertex(nd));
        if(nd.id)
          flow_graph.addEdge(funcVertex(nd), varVertex(nd.id));
        break;
      case 'LogicalExpression':
        if(nd.operator === '||')
          flow_graph.addEdge(vertexFor(nd.left), vertexFor(nd));
        flow_graph.addEdge(vertexFor(nd.right), vertexFor(nd));
        break;
      case 'ObjectExpression':
        nd.properties.forEach(function(prop) {
          if(prop.kind === 'init') {
            flow_graph.addEdge(vertexFor(prop.value), propVertex(prop.key));
          }
        });
        break;
      case 'ReturnStatement':
        if(nd.argument)
          flow_graph.addEdge(vertexFor(nd.argument), retVertex(nd.attr.enclosingFunction));
        break;
      case 'SequenceExpression':
        flow_graph.addEdge(vertexFor(nd.expressions[nd.expressions.length-1]), vertexFor(nd));
        break;
      case 'ThrowStatement':
        flow_graph.addEdge(vertexFor(nd.argument), unknownVertex());
        break;
      case 'VariableDeclarator':
        if(nd.init)
          flow_graph.addEdge(vertexFor(nd.init), vertexFor(nd.id));
        break;
      case 'WithStatement':
        throw new Error("'with' statement not supported");
      }
    });
    return flow_graph;
  }
  
  function vertexFor(nd) {
    switch(nd.type) {
    case 'Identifier':
      var decl = nd.attr.scope.get(nd.name);
      return decl ? varVertex(decl) : propVertex(nd);
    case 'ThisExpression':
      var decl = nd.attr.scope.get('this');
      return decl ? varVertex(decl) : exprVertex(nd);
    case 'MemberExpression':
      if(!nd.computed)
        return propVertex(nd.property);
      // FALL THROUGH
    default:
      return exprVertex(nd);
    }
  }
  
  function varVertex(nd) {
    if(nd.type !== 'Identifier')
      throw new Error("invalid variable vertex");
    
    return nd.attr.var_vertex
        || (nd.attr.var_vertex = {
             type: 'VarVertex',
             node: 'nd',
             attr: { pp: function() { return 'Var(' + nd.name + '@' + astutil.ppPos(nd) + ')'; } }
           });
  }
  
  var propVertices = new symtab.Symtab();
  function propVertex(nd) {
    var p;
    if(nd.type === 'Identifier')
      p = nd.name;
    else if(nd.type === 'Literal')
      p = nd.value + "";
    else
      throw new Error("invalid property vertex");

    return propVertices.get(p, { type: 'PropertyVertex',
                                 name: p,
                                 attr: { pp: function() { return 'Prop(' + p + ')'; } } });
  }
  
  var theUnknownVertex = { type: 'UnknownVertex',
                           attr: { pp: function() { return 'Unknown'; } } };
  function unknownVertex() {
    return theUnknownVertex;
  }
  
  function funcVertex(fn) {
    if(fn.type !== 'FunctionDeclaration' && fn.type !== 'FunctionExpression')
      throw new Error("invalid function vertex");
    return fn.attr.func_vertex
        || (fn.attr.func_vertex = {
             type: 'FuncVertex',
             node: fn,
             attr: { pp: function() { return 'Func(' + astutil.ppPos(fn) + ')'; } }
           });
  }
  
  function parmVertex(fn, i) {
    if(fn.type !== 'FunctionDeclaration' && fn.type !== 'FunctionExpression')
      throw new Error("invalid function vertex");
    var vertex;
    if(i === 0) {
      vertex = varVertex(fn.attr.scope.get('this'));
    } else {
      vertex = varVertex(fn.params[i-1]);
    }
    return vertex;
  }
  
  function retVertex(fn) {
    if(fn.type !== 'FunctionDeclaration' && fn.type !== 'FunctionExpression')
      throw new Error("invalid return vertex");
    
    return fn.attr.ret_vertex
        || (fn.attr.ret_vertex = {
              type: 'ReturnVertex',
              node: fn,
              attr: { pp: function() { return 'Ret(' + astutil.ppPos(fn) + ')'; } }
           });
  }
  
  function calleeVertex(nd) {
    if(nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
      throw new Error("invalid callee vertex");
    
    return nd.attr.callee_vertex
        || (nd.attr.callee_vertex = {
             type: 'CalleeVertex',
             node: nd,
             attr: { pp: function() { return 'Callee(' + astutil.ppPos(nd) + ')'; } }
           });
  }
  
  function argVertex(nd, i) {
    if(nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
      throw new Error("invalid callee vertex");
    if(i === 0) {
      return nd.attr.receiver_vertex
          || (nd.attr.receiver_vertex = {
               type: 'ArgumentVertex',
               node: nd,
               attr: { pp: function() { return 'Arg(' + astutil.ppPos(nd) + ', 0)'; } }
             });
    } else {
      return nd.arguments[i-1].attr.arg_vertex
          || (nd.arguments[i-1].attr.arg_vertex = {
               type: 'ArgumentVertex',
               node: nd,
               attr: { pp: function() { return 'Arg(' + astutil.ppPos(nd) + ', ' + i + ')'; } }
             });
    }
  }
  
  function resVertex(nd) {
    if(nd.type !== 'CallExpression' && nd.type !== 'NewExpression')
      throw new Error("invalid result vertex");
    return nd.attr.res_vertex
        || (nd.attr.res_vertex = {
             type: 'ResVertex',
             node: nd,
             attr: { pp: function() { return 'Res(' + astutil.ppPos(nd) + ')'; } }
           });
  }
  
  function exprVertex(nd) {
    if(!nd.type)
      throw new Error("invalid expression vertex");
    return nd.attr.expr_vertex
        || (nd.attr.expr_vertex = {
             type: 'ExprVertex',
             node: nd,
             attr: { pp: function() { return 'Expr(' + astutil.ppPos(nd) + ')'; } }
           });
  }
  
  exports.buildOneShotCallGraph = buildOneShotCallGraph;
  exports.addIntraproceduralFlowGraphEdges = addIntraproceduralFlowGraphEdges;
  return exports;
});