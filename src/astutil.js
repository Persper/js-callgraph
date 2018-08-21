/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const esprima = require('esprima');
const fs = require('fs');
const sloc  = require('sloc');
const escodegen = require('escodegen');
const babel = require('babel-core');

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

/* AST visitor with state */
function visitWithState(root, visitor) {
    const state = {
        'withinDeclarator': false,
        'withinParams': false
    };

    function doVisit(nd, parent, childProp) {
        if (!nd || typeof nd !== 'object')
            return;

        if (nd.type) {
            var res = visitor(nd, doVisit, state, parent, childProp);
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
    visit(root, function (nd, doVisit, state, parent, childProp) {
        if (nd.type && !nd.attr)
            nd.attr = {};

        if (enclosingFunction)
            nd.attr.enclosingFunction = enclosingFunction;
        if (enclosingFile)
            nd.attr.enclosingFile = enclosingFile;

        if (nd.type === 'Program') {
            enclosingFile = nd.attr.filename;
            nd.type = 'FunctionDeclaration';
            nd.id = {
                    "type": "Identifier",
                    "name": "global"
                };
            nd.params = [];
        }

        if (nd.type === 'FunctionDeclaration' ||
            nd.type === 'FunctionExpression'  ||
            nd.type === 'ArrowFunctionExpression') {

            root.attr.functions.push(nd);
            nd.attr.parent = parent;
            nd.attr.childProp = childProp;
            var old_enclosingFunction = enclosingFunction;
            enclosingFunction = nd;
            doVisit(nd.id);
            doVisit(nd.params);
            doVisit(nd.body);
            enclosingFunction = old_enclosingFunction;
            return false;
        }

        // Method Definition
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions
        //
        // interface MethodDefinition {
        //     type: 'MethodDefinition';
        //     key: Expression | null;
        //     computed: boolean;
        //     value: FunctionExpression | null;
        //     kind: 'method' | 'constructor';
        //     static: boolean;
        // }
        if (nd.type === 'MethodDefinition')
            if (!nd.computed)
                nd.value.id = nd.key;
            else
                console.log("WARNING: Computed property for method definition, not yet supported.");

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

function isAnon(funcName) {
    return funcName === "anon";
}

// func must be function node in ast
function funcname(func) {
    if (func === undefined)
        console.log('WARNING: func undefined in astutil/funcname.');
    else if (func.id === null)
        return "anon";
    else
        return func.id.name;
}

// encFunc can be undefined
function encFuncName(encFunc) {
    if (encFunc === undefined) {
        console.log("WARNING encFunc should NOT be undefined")
        return "global";
    } else if (encFunc.id === null)
        return "anon";
    else
        return encFunc.id.name
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

function stripFlowPrep(src) {
    return babel.transform(src, {
        presets: ['flow'],
        retainLines: true,
        parserOpts: {strictMode: false}
    }).code;
}

/* Trim hashbang to avoid the parser blowing up
Example:
    #!/usr/bin/env node
Reference:
    https://github.com/jquery/esprima/issues/1151
*/
function trimHashbangPrep(src) {
    if (src.substring(0, 2) === '#!') {
        var end = src.indexOf('\n');
        var filler = '';
        for (var i = 0; i < end; ++i) {
           filler += ' ';
        }
        src = filler + src.substring(end, src.length);
    }
    return src;
}

/* Parse src and return an esprima ast, wrapper around singleSrcAST */
function buildSingleAST(fname, src, stripFlow) {
    if (stripFlow)
        return singleSrcAST(fname, src, [trimHashbangPrep, stripFlowPrep]);
    else
        return singleSrcAST(fname, src, [trimHashbangPrep]);
}

/*
Args:
    preprocessor - A list of preprocessor
                 - which takes a string (src code) as input
                 - and returns a string (the preprocessed code)
*/
function singleSrcAST (fname, src, preprocessors) {
    try {
        if (preprocessors)
            for (let prep of preprocessors)
                src = prep(src);
    }
    catch(err) {
        console.log('-------------------------------------------')
        console.log('Warning: Preprocessing errored ' + fname)
        console.log(err.stack);
        console.log('-------------------------------------------')
    }
    let prog;
    try {
        prog = esprima.parseModule(src,
            {loc: true, range: true, tolerant: true, jsx: true});
    }
    catch(err) {
        console.log('-------------------------------------------')
        console.log('Warning: Esprima failed to parse ' + fname);
        console.log(err.stack);
        console.log('-------------------------------------------')
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
        let funcName = funcname(fn);

        // startLine && endLine
        let startLine = fn.loc.start['line'];
        let endLine = fn.loc.end['line'];

        // name, file and range are for colon format id
        // code and encFuncName are added for trackFunctions
        funcs.push({
            'name': funcName,
            'file': fn.attr.enclosingFile,
            'range': [startLine, endLine],
            'code': astToCode(fn),
            'encFuncName': encFuncName(fn.attr.enclosingFunction)
        });
    }
    funcs.forEach(funcObj => {
        funcObj['cf'] = cf(funcObj);
    });
    return funcs;
}

/* Check if nd is an assignment to module.exports

Args:
    nd - an ast node

Returns:
    true if nd represents an assignment to module.exports, false otherwise

Relevant docs:

    interface MemberExpression {
        type: 'MemberExpression';
        computed: boolean;
        object: Expression;
        property: Expression;
    }
*/
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

/*
Args:
       nd - an ast node
  fn_name - a function name to compare to

Returns: true if nd represents a call to fn_name, false otherwise

Relevant docs:

    interface CallExpression {
        type: 'CallExpression';
        callee: Expression;
        arguments: ArgumentListElement[];
    }
*/
function isCallTo(nd, fn_name) {
    if (nd.type !== 'CallExpression')
        return false;

    let callee = nd.callee;

    if (callee.type !== 'Identifier')
        return false;

    return callee.name === fn_name
}

/*
Args:
       fn - an ast node representing a FunctionDeclaration

Returns:
    A list containing all of the ReturnStatement nodes' values in fn's body

Relevant docs:

    interface FunctionDeclaration {
        type: 'FunctionDeclaration';
        id: Identifier | null;
        params: FunctionParameter[];
        body: BlockStatement;
        generator: boolean;
        async: boolean;
        expression: false;
    }

    interface BlockStatement {
        type: 'BlockStatement';
        body: StatementListItem[];
    }

    interface ReturnStatement {
        type: 'ReturnStatement';
        argument: Expression | null;
    }
*/
function getReturnValues(fn) {
    let fn_body = fn.body.body;
    let lst = [];

    for (var i = 0; i < fn_body.length; i++)
        if (fn_body[i].type === 'ReturnStatement')
            lst.push(fn_body[i].argument);

    return lst;
}

module.exports.visit = visit;
module.exports.visitWithState = visitWithState;
module.exports.init = init;
module.exports.ppPos = ppPos;
module.exports.funcname = funcname;
module.exports.encFuncName = encFuncName;
module.exports.buildAST = buildAST;
module.exports.buildSingleAST = buildSingleAST;
module.exports.getFunctions = getFunctions;
module.exports.isAnon = isAnon;
module.exports.isModuleExports = isModuleExports;
module.exports.isCallTo = isCallTo;
module.exports.getReturnValues = getReturnValues;
