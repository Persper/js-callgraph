if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require, exports) {
  var esprima = require('./esprima');
    
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
        if(!nd.hasOwnProperty(p) || p.match(/^(range|loc|attr|comments|raw)$/))
          continue;
        doVisit(nd[p]);
      }
    }
    
    doVisit(root);
  }
  
  function init(root) {
    var enclosingFunction = null, enclosingFile = null;
    root.attr.functions = [];
    root.attr.calls = [];
    visit(root, function(nd, visit) {
      if(nd.type && !nd.attr)
        nd.attr = {};
      
      if(enclosingFunction)
        nd.attr.enclosingFunction = enclosingFunction;
      if(enclosingFile)
        nd.attr.enclosingFile = enclosingFile;

      if(nd.type === 'Program')
        enclosingFile = nd.attr.filename;
      
      if(nd.type === 'FunctionDeclaration' || nd.type === 'FunctionExpression') {
        root.attr.functions.push(nd);
        var old_enclosingFunction = enclosingFunction;
        enclosingFunction = nd;
        visit(nd.id);
        visit(nd.params);
        visit(nd.body);
        enclosingFunction = old_enclosingFunction;
        return false;
      }

      if(nd.type === 'CallExpression' || nd.type === 'NewExpression')
        root.attr.calls.push(nd);
    });
  }

  function basename(filename) {
    if(!filename)
      return "<???>";
    var idx = filename.lastIndexOf('/');
    if(idx === -1)
      idx = filename.lastIndexOf('\\');
    return filename.substring(idx+1);
  }
  
  function ppPos(nd) {
    return basename(nd.attr.enclosingFile) + "@" + nd.loc.start.line + ":" + nd.range[0] + "-" + nd.range[1];
  }

  function buildAST(sources) {
    var ast = {
      type: 'ProgramCollection',
      programs: [],
      attr: {}
    };
    sources.forEach(function(source) {
      var prog = esprima.parse(source.program, { loc: true, range: true });
      prog.attr = { filename: source.filename };
      ast.programs.push(prog);
    });
    init(ast);
    return ast;
  }
  
  exports.visit = visit;
  exports.init = init;
  exports.ppPos = ppPos;
  exports.buildAST = buildAST;
  return exports;
});