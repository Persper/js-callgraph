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
const vueParser = require('vue-parser');
const prep = require('./srcPreprocessor');

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
    visit(root, function (nd, doVisit, parent, childProp) {
        if (nd.type && !nd.attr)
            nd.attr = {};

        if (enclosingFunction)
            nd.attr.enclosingFunction = enclosingFunction;
        if (enclosingFile)
            nd.attr.enclosingFile = enclosingFile;

        if (nd.type === 'Program') {
            enclosingFile = nd.attr.filename;
        }

        /* Method Definition (Case 1)

        This case is covered by test case: tests/basics/method-def.truth

        Example:

            var obj = {
                methodName: function () {
                    return 42;
                }
            }

        Esprima AST:

            interface Property {
                type: 'Property';
                key: Expression;
                computed: boolean;
                value: Expression | null;
                kind: 'get' | 'set' | 'init';
                method: false;
                shorthand: boolean;
            }
        */
        if (nd.type === 'FunctionExpression' && parent.type === 'Property') {
            if (!parent.computed) {
                if (parent.key.type === 'Identifier'){
                    nd.id = parent.key;
                }
                else if (parent.key.type === 'Literal') {
                    // create a new `Identifier` AST node and set it to `FunctionExpression`'s id
                    nd.id = {
                        type: 'Identifier',
                        name: parent.key.value,
                        range: parent.key.range,
                        loc: parent.key.loc
                    };
                }
                else {
                    console.log("WARNING: unexpected key type of 'Property'.");
                }
            }
            else
                console.log("WARNING: Computed property for method definition, not yet supported.");
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

        /* Method Definition (Case 2)
        Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions

        Example:

            class Apple {
                color () {
                    return 'red';
                }
            }

        Esprima AST:

            interface MethodDefinition {
                type: 'MethodDefinition';
                key: Expression | null;
                computed: boolean;
                value: FunctionExpression | null;
                kind: 'method' | 'constructor';
                static: boolean;
            }
        */
        if (nd.type === 'MethodDefinition')
            if (!nd.computed) {
                if (nd.key.type === 'Identifier') {
                    nd.value.id = nd.key;
                }
                else if (nd.key.type === 'Literal') {
                    // this case is covered by test case: tests/unexpected/stringiterator.truth
                    console.log("WARNING: invalid syntax, method name is of type Literal instead of Identifier.");
                }
                else {
                    console.log("WARNING: unexpected key type of 'MethodDefinition'.");
                }
            }
            else {
                console.log("WARNING: Computed property for method definition, not yet supported.");
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

/* Build as AST from a collection of source files */
function astFromFiles(files) {
    const ast = {
        type: 'ProgramCollection',
        programs: [],
        attr: {}
    }

    for (let file of files) {
        let src = fs.readFileSync(file, 'utf-8');
        ast.programs.push(buildProgram(file, src));
    }
    init(ast);
    return ast;
}

/* Build an AST from file name and source code
Args:
    fname - A string, the name of the source file
      src - A string, the source code

Return:
    If succeeded, return an ast node of type 'ProgramCollection'.
    If failed, return null.
*/
function astFromSrc(fname, src) {
    const prog = buildProgram(fname, src);
    if (prog === null)
        return null;
    const ast = {
        'type': 'ProgramCollection',
        'programs': [prog],
        'attr': {}
    }
    init(ast);
    return ast;
}

function reportError(msg, err) {
    console.log('-------------------------------------------');
    console.log(msg);
    console.log(err.stack);
    console.log('-------------------------------------------');
}

/* Returns an ast node of type 'Program'
To avoid confusion caused by too many different parsing settings,
please call this function whenever possible instead of rewriting esprima.parseModule...
*/
function parse(src) {
    return esprima.parseModule(src, {
        loc: true,
        range: true,
        jsx: true
    });
}

/* Parse a single source file and return its ast
Args:
    fname - A string, the name of the source file
      src - A string, the source code

Return:
    If succeeded, return an ast node of type 'Program'.
    If failed, return null.
*/
function buildProgram (fname, src) {
    // trim hashbang
    src = prep.trimHashbangPrep(src);
    // extract script from .vue file
    try {
        if (fname.endsWith('.vue'))
            src = vueParser.parse(src, 'script');
    }
    catch (err) {
        reportError('WARNING: Extracting <script> from .vue failed.', err);
        return null;
    }

    // transpile typescript
    try {
        if (fname.endsWith('.ts'))
            src = prep.typescriptPrep(fname, src);
    }
    catch (err) {
        reportError('WARNING: Transpiling typescript failed.', err);
        return null;
    }

    // parse javascript
    let prog;
    try {
        prog = parse(src);
    }
    catch(err) {
        reportError('Warning: Esprima failed to parse ' + fname, err);
        return null;
    }
    prog.attr = {filename: fname};
    return prog;
}

// cf is used by getFunctions
const cf = funcObj => {
    return funcObj.file + ':' +
           funcObj.name + ':' +
           funcObj.range[0] + ':' +
           funcObj.range[1] + ':' +
           (funcObj.charRange[1] - funcObj.charRange[0]);
};

/* Return a list of objects storing function info in root

Args:
    root - An ast node of type 'ProgramCollection',
         - the output of astFromSrc function,
         - thus, root.programs.length is equal to 1
    src  - A string, the corresponding source code of `root`

Returns:
    A list of objects, each with the following properties
    {
        'name': a valid function name | 'anon' | 'global',
        'file': a valid file name,
        'range': a list of two integers,
        'code': code of the function | null (for global context),
        'encFuncName': a valid function name | 'anon' | 'global' | null (for global context),
        'cf': a string representing the colon format id
    }
*/
function getFunctions(root, src) {
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
            'charRange': fn.range,
            'code': src.substring(fn.range[0], fn.range[1]),
            'encFuncName': encFuncName(fn.attr.enclosingFunction)
        });
    }

    // Add 'cf' property
    funcs.forEach(funcObj => {
        funcObj['cf'] = cf(funcObj);
    });

    // Create a fake function object for global context
    console.assert(root.programs.length === 1);
    let prog = root.programs[0];
    funcs.push({
        'name': 'global',
        'file': prog.attr.filename,
        'range': [prog.loc.start['line'], prog.loc.end['line']],
        'charRange': null,
        'code': null,
        'encFuncName': null,
        'cf': prog.attr.filename + ':global'
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
    let lst = [];
    let fn_body = fn.body;
    /* There're two cases here:
    Case 1. fn_body is of type 'BlockStatement'
        this is the most common case, for example
        const f = () => {return 1;};
    Case 2. fn_body is not of type 'BlockStatement'
        this case is covered by test case:
            tests/import-export/define/arrow-func-no-block-statement-require.truth
        const f = () => 1;

        Esprima output:
        {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "declarations": [
                        {
                            "type": "VariableDeclarator",
                            "id": {
                                "type": "Identifier",
                                "name": "f"
                            },
                            "init": {
                                "type": "ArrowFunctionExpression",
                                "id": null,
                                "params": [],
                                "body": {
                                    "type": "Literal",
                                    "value": 1,
                                    "raw": "1"
                                },
                                "generator": false,
                                "expression": true,
                                "async": false
                            }
                        }
                    ],
                    "kind": "const"
                }
            ],
            "sourceType": "script"
        }
    */
    if (fn_body.type === 'BlockStatement') {
        let block = fn_body.body;
        for (var i = 0; i < block.length; i++)
                if (block[i].type === 'ReturnStatement')
                    lst.push(block[i].argument);
    }
    else {
        lst.push(fn_body);
    }
    return lst;
}

/*
Args:
    nd - An ast node

Returns:
    A boolean, true if nd is a function declaration
    or function expression or arrow function expression,
    false otherwise.
*/
function isFunction(nd) {
   return nd.type === 'FunctionDeclaration' ||
          nd.type === 'FunctionExpression' ||
          nd.type === 'ArrowFunctionExpression'
}

module.exports.visit = visit;
module.exports.visitWithState = visitWithState;
module.exports.init = init;
module.exports.ppPos = ppPos;
module.exports.funcname = funcname;
module.exports.encFuncName = encFuncName;
module.exports.astFromFiles = astFromFiles;
module.exports.astFromSrc = astFromSrc;
module.exports.parse = parse;
module.exports.getFunctions = getFunctions;
module.exports.isAnon = isAnon;
module.exports.isModuleExports = isModuleExports;
module.exports.isCallTo = isCallTo;
module.exports.getReturnValues = getReturnValues;
module.exports.isFunction= isFunction;
module.exports.cf= cf;
