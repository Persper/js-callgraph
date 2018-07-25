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

/* This module provides an AST visitor function, and several
 * other utility functions. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var esprima = require('esprima');
    var fs = require('fs');
    var sloc  = require('sloc');
    var escodegen = require('escodegen');

    /* AST visitor */
    function visit(root, visitor) {
        function doVisit(nd, parent, childProp) {
            if (!nd || typeof nd !== 'object')
                return;

            if (nd.type) {
                var res = visitor(nd, doVisit, parent, childProp);
                if (res === false)
                    return;
            }

            for (var p in nd) {
                // skip over magic properties
                if (!nd.hasOwnProperty(p) || p.match(/^(range|loc|attr|comments|raw)$/))
                    continue;
                doVisit(nd[p], nd, p);
            }
        }

        doVisit(root);
    }

    /* Set up `attr` field that can be used to attach attributes to
     * nodes, and fill in `enclosingFunction` and `enclosingFile`
     * attributes. */
    function init(root) {
        var enclosingFunction = null, enclosingFile = null;
        // global collections containing all functions and all call sites
        root.attr.functions = [];
        root.attr.calls = [];
        visit(root, function (nd, visit, parent, childProp) {
            if (nd.type && !nd.attr)
                nd.attr = {};

            if (enclosingFunction)
                nd.attr.enclosingFunction = enclosingFunction;
            if (enclosingFile)
                nd.attr.enclosingFile = enclosingFile;

            if (nd.type === 'Program')
                enclosingFile = nd.attr.filename;

            if (nd.type === 'FunctionDeclaration' ||
                nd.type === 'FunctionExpression'  ||
                nd.type === 'ArrowFunctionExpression') {

                root.attr.functions.push(nd);
                nd.attr.parent = parent;
                nd.attr.childProp = childProp;
                var old_enclosingFunction = enclosingFunction;
                enclosingFunction = nd;
                visit(nd.id);
                visit(nd.params);
                visit(nd.body);
                enclosingFunction = old_enclosingFunction;
                return false;
            }

            if (nd.type === 'CallExpression' || nd.type === 'NewExpression')
                root.attr.calls.push(nd);
        });
    }

    /* Simple version of UNIX basename. */
    function basename(filename) {
        if (!filename)
            return "<???>";
        var idx = filename.lastIndexOf('/');
        if (idx === -1)
            idx = filename.lastIndexOf('\\');
        return filename.substring(idx + 1);
    }

    function en_funcname(func) {
        if (func === undefined) {
          return "global"
        } else if (func.id == null) {
          return "undefined"
        }
        return func.id.name
    }

    function funcname(func) {
        if (func === undefined || func.id == null) {
          return "undefined"
        }
        return func.id.name
    }

    /* Pretty-print position. */
    function ppPos(nd) {
        return basename(nd.attr.enclosingFile) + "@" + nd.loc.start.line + ":" + nd.range[0] + "-" + nd.range[1];
    }

    /* Build an AST from a collection of source files. */
    function buildAST(files) {
        var sources = files.map(function (file) {
            return { filename: file,
                program: fs.readFileSync(file, 'utf-8') };
        });

        var ast = {
            type: 'ProgramCollection',
            programs: [],
            attr: {}
        };
        sources.forEach(function (source) {
            var prog = esprima.parseModule(source.program, { loc: true, range: true, tolerant: true});
            prog.attr = { filename: source.filename, sloc : sloc(source.program, "js").sloc};
            ast.programs.push(prog);
        });
        init(ast);
        ast.attr.sloc = ast.programs
            .map(function(program){
                return program.attr.sloc;
            }).reduce(function(previous, current) {
            return previous + current;
        });
        return ast;
    }

    function singleSrcAST (fname, src, preprocessor) {
        try {
          if (preprocessor) {
              const prepOut = preprocessor(src);
              src = prepOut.code;
          }
        } catch(err) {
          console.log('Warning: Preprocessing errored')
        }
        let prog;
        try {
          prog = esprima.parseModule(src, {loc: true, range: true, tolerant: true});
        } catch(err) {
          console.log('Warning: Esprima failed to parse');
          return null;
        }
        prog.attr = {filename: fname, sloc: sloc(src, 'js').sloc };

        const ast = {
            'type': 'ProgramCollection',
            'programs': [prog],
            'attr': {sloc: prog.attr.sloc}
        }
        init(ast);
        return ast;
    }

    // cf is used by getFunctions
    const cf = funcObj => {
        return funcObj.file + ':' + funcObj.name + ':' +
            funcObj.range[0] + ':' + funcObj.range[1];
    };

    // astToCode is used by getFunctions
    const astToCode = astNode => {
        return escodegen.generate(astNode, {
            'compact': true,
            'comment': false
        });
    }

    function getFunctions(root) {
        const funcs = [];
        const funcNodes = root.attr.functions;

        for (let i = 0; i < funcNodes.length; ++i) {
            const fn = funcNodes[i];

            // funcName
            let funcName = null;
            if (fn.id)
                funcName = fn.id.name;

            // startLine && endLine
            let startLine = fn.loc.start['line'];
            let endLine = fn.loc.end['line'];

            // encFunc (enclosing function)
            let encFunc = fn.attr.enclosingFunction || 'global'

            // name, file and range are for colon format id
            // code and encFunc are added for trackFunctions
            funcs.push({
                'name': funcName,
                'file': fn.attr.enclosingFile,
                'range': [startLine, endLine],
                'code': astToCode(fn),
                'encFunc': encFunc
            });
        }
        funcs.forEach(funcObj => {
            funcObj['cf'] = cf(funcObj);
        });
        return funcs;
    }

    exports.visit = visit;
    exports.init = init;
    exports.ppPos = ppPos;
    exports.funcname = funcname;
    exports.en_funcname = en_funcname;
    exports.buildAST = buildAST;
    exports.singleSrcAST = singleSrcAST;
    exports.getFunctions = getFunctions;
    return exports;
});
