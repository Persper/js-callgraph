/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Max Schaefer - initial API and implementation
 *******************************************************************************/

/* Optimistic call graph builder that tries to be clever about
 * which interprocedural flows to propagate: it only propagates
 * along edges that lead to a function call. */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var graph = require('./graph'),
        natives = require('./natives'),
        flowgraph = require('./flowgraph'),
        callgraph = require('./callgraph'),
        astutil = require('./astutil'),
        path = require('path');

    /* Arguments:
               nd - an ast node

       Return value: true if nd represents an assignment to module.exports
                     false otherwise */
    function isModuleExports(nd) {
        if (nd.type !== 'AssignmentExpression')
            return false;

        let left = nd.left;

        if (left.type !== 'MemberExpression')
            return  false;

        let object = left.object;
        let property = left.property;

        if (object.type !== 'Identifier' || property.type !== 'Identifier')
            return false;

        return object.name === 'module' && property.name === 'exports';
    }

    /* Arguments:
               nd - an ast node
          fn_name - a function name to compare to

      Return value: true if nd represents a call to fn_name
                    false otherwise */
    function isCallTo(nd, fn_name) {
      if (nd.type !== 'CallExpression')
        return false;

      let callee = nd.callee;

      if (callee.type !== 'Identifier')
        return false;

      return callee.name === fn_name
    }

    /* Arguments:
               fn - an ast node representing a FunctionDeclaration

       Return value: a list containing all of the ReturnStatement
                     nodes' values in fn's body */
    function getReturnValues(fn) {
      let fn_body = fn.body.body;
      let lst = [];

      for (var i = 0; i < fn_body.length; i++)
        if (fn_body[i].type === 'ReturnStatement')
          lst.push(fn_body[i].argument);

      return lst;
    }

    /* Arguments:
          exp_fns - a dictionary with filenames as keys
                    and a list of exported values as values
         filename - a filename
               nd - a node in an ast

       Postcondition: nd has been paired with filename in exp_fns */
    function addDefaultExport(exp_fns, filename, nd) {
      if (filename in exp_fns) {
        exp_fns[filename]['default'].push(nd);
      }
      else {
        exp_fns[filename] = {'default': [], 'named': {}, 'redirect': []};
        exp_fns[filename]['default'] = [nd];
      }
    }

    function addNamedExport(exp_fns, filename, local, exported) {
      if (filename in exp_fns) {
        let named = exp_fns[filename]['named']

        if (exported in named) {
          named[exported] = named[exported].push(local);
        } else {
          named[exported] = [local];
        }
      } else {
        exp_fns[filename] = {'default': [], 'named': {}, 'redirect': []};
        exp_fns[filename]['named'][exported] = [local];
      }
    }

    function addRedirectExport(exp_fns, filename, exp_filename) {
      if (filename in exp_fns) {
        exp_fns[filename]['redirect'].push(exp_filename);
      }
      else {
        exp_fns[filename] = {'default': [], 'named': {}, 'redirect': []};
        exp_fns[filename]['redirect'].push(exp_filename);
      }
    }

    function removeExports(filename, exportFuncs) {
      delete exportFuncs[filename];
    }

    /* Arguments: ast - a ProgramCollection
       Return value: dictionary with filenames as keys
                     and a list of exported values as values */
    function collectExports(ast, exported_functions) {

      for (var i = 0; i < ast.programs.length; i++) {
        let filename = ast.programs[i].attr.filename;
        filename = path.resolve(filename);

        astutil.visit(ast.programs[i], function (nd) {
          /* Handles: module.exports = fn */
          if (isModuleExports(nd)) {
            addDefaultExport(exported_functions, filename, nd.right);
          }
          /* Handles: define(function() {return fn;}) */
          if (isCallTo(nd, 'define')) {
            let ret_vals = getReturnValues(nd.arguments[nd.arguments.length - 1]);

            for (var i = 0; i < ret_vals.length; i++)
                addDefaultExport(exported_functions, filename, ret_vals[i]);
          }
          /* Handles: export default ___  */
          if (nd.type === 'ExportDefaultDeclaration') {
            addDefaultExport(exported_functions, filename, nd.declaration);
          }
          if (nd.type === 'ExportNamedDeclaration') {
            if (nd.source) {
              let exported_file = getImportedFile(filename, nd.source);
              addRedirectExport(exported_functions, filename, exported_file);
            } else {
              for (var i = 0; i < nd.specifiers.length; i++){
                  let specifier = nd.specifiers[i]
                  addNamedExport(exported_functions, filename,
                                 specifier['local'], specifier['exported'].name);

              }
            }
          }
          if (nd.type === 'ExportAllDeclaration') {

          }
        })
      }
      return exported_functions;
    }

    /* Arguments:
         curr_filename - full path of the file calling require
                    nd - ast node representing call to require

       Return value: full path of file being required */
    function getRequiredFile(curr_filename, nd) {
      let argument = nd.arguments[0].value;

      if (argument === undefined) {
        return
      }

      let required_file = argument.slice(2);
      required_file = path.resolve(curr_filename, '..', required_file);
      required_file = required_file + '.js';

      return required_file
    }
    function getImportedFile(curr_filename, nd) {
      let argument = nd.value;
      let required_file = path.resolve(curr_filename, '..', argument);
      required_file = required_file + '.js';

      return required_file
    }

    function addDefaultImport(exp_fns, fg, imported_file, ast) {
      if (!(imported_file in exp_fns))
          return;

      let defaults = exp_fns[imported_file]['default'];

      for (var i = 0; i < defaults.length; i++) {
        let exp = defaults[i];

        if (exp.type === 'FunctionDeclaration')
            fg.addEdge(flowgraph.funcVertex(exp),
                       flowgraph.vertexFor(ast));
        else
            fg.addEdge(flowgraph.vertexFor(exp),
                       flowgraph.vertexFor(ast));
      }
    }

    function addNamedImport(exp_fns, fg, imported_file, local, imported) {
      if (!(imported_file in exp_fns))
          return;

      let redirect = exp_fns[imported_file]['redirect'];

      for (let i = 0; i < redirect.length; i++) {
           addNamedImport(exp_fns, fg, redirect[i], local, imported);
      }
      let named = exp_fns[imported_file]['named'];

      if (!(imported in named))
          return;

      let imp = named[imported];

      for (let i = 0; i < imp.length; i++) {
        if (imp[i].type === 'FunctionDeclaration')
            fg.addEdge(flowgraph.funcVertex(imp[i]),
                       flowgraph.vertexFor(local));
        else
            fg.addEdge(flowgraph.vertexFor(imp[i]),
                       flowgraph.vertexFor(local));
      }
    }

    /* Arguments:
              ast - a ProgramCollection
               fg - a flowgraph
          exp_fns - a dictionary with filenames as keys
                    and a list of exported values as values

       Postcondition: edges connecting imports to the corresponding
                      exported value have been added to the flowgraph */
    function connectImports(ast, fg, exp_fns) {
      for (var i = 0; i < ast.programs.length; i++) {
        let filename = ast.programs[i].attr.filename;

        astutil.visit(ast.programs[i], function (nd) {
          if (nd.type === 'VariableDeclarator') {
            let init = nd.init;

            if (init && isCallTo(init, 'require')) {
              let required_file = getRequiredFile(filename, init);
              if (required_file in exp_fns)
                 addDefaultImport(exp_fns, fg, required_file, nd.id);
            }
          }
          if (nd.type === 'ImportDeclaration') {
            let imported_file = getImportedFile(filename, nd.source);
            for (var i = 0; i < nd.specifiers.length; i++) {
              let specifier = nd.specifiers[i];
              switch (specifier.type) {
                case 'ImportSpecifier':
                    addNamedImport(exp_fns, fg, imported_file,
                                   specifier.local, specifier.imported.name);
                    break;
                case 'ImportDefaultSpecifier':
                    addDefaultImport(exp_fns, fg, imported_file, specifier.local);
                    break;
                case 'ImportNamespaceSpecifier':
                    break;
              }

            }
          }
        })
      }
    }

    function addInterproceduralFlowEdges(ast, fg) {
        fg = fg || new graph.Graph();

        var changed;
        do {
            changed = false;

            var reach = fg.reachability(function (nd) {
                return nd.type !== 'UnknownVertex';
            });

            ast.attr.calls.forEach(function (call) {
                var res = flowgraph.resVertex(call);
                if (!res.attr.interesting)
                    reach.iterReachable(res, function (nd) {
                        if (nd.type === 'CalleeVertex') {
                            res.attr.interesting = true;
                        }
                    });
            });

            ast.attr.functions.forEach(function (fn) {
                var interesting = false, nparams = fn.params.length;

                for (var i = 0; i <= nparams; ++i) {
                    var param = flowgraph.parmVertex(fn, i);
                    if (!param.attr.interesting) {
                        reach.iterReachable(param, function (nd) {
                            if (nd.type === 'CalleeVertex') {
                                param.attr.interesting = true;
                            }
                        });
                    }
                    interesting = interesting || param.attr.interesting;
                }

                reach.iterReachable(flowgraph.funcVertex(fn), function (nd) {
                    if (nd.type === 'CalleeVertex') {
                        var call = nd.call, res = flowgraph.resVertex(call);

                        if (res.attr.interesting) {
                            var ret = flowgraph.retVertex(fn);
                            if (!fg.hasEdge(ret, res)) {
                                changed = true;
                                fg.addEdge(ret, res);
                            }
                        }

                        if (interesting)
                            for (var i = 0; i <= nparams; ++i) {
                                if (i > call.arguments.length)
                                    break;

                                var param = flowgraph.parmVertex(fn, i);
                                if (param.attr.interesting) {
                                    var arg = flowgraph.argVertex(call, i);
                                    if (!fg.hasEdge(arg, param)) {
                                        changed = true;
                                        fg.addEdge(arg, param);
                                    }
                                }
                            }
                    }
                });
            });
        } while (changed); // until fixpoint

        return fg;
    }

    function buildCallGraph(ast) {
        var fg = new graph.Graph();
        natives.addNativeFlowEdges(fg);
        flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);

        let exported_functions = collectExports(ast);
        connectImports(ast, fg, exported_functions);

        addInterproceduralFlowEdges(ast, fg);

        return callgraph.extractCG(ast, fg);
    }

    exports.addInterproceduralFlowEdges = addInterproceduralFlowEdges;
    exports.buildCallGraph = buildCallGraph;
    exports.removeExports = removeExports;
    exports.collectExports = collectExports;
    exports.connectImports = connectImports;
    return exports;
});
