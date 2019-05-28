/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const astutil = require('./astutil');
const flowgraph = require('./flowgraph');
const path = require('path');

/* Export

Syntax:
    // Named
    export { name1, name2, …, nameN };
    export { variable1 as name1, variable2 as name2, …, nameN };
    export let name1, name2, …, nameN; // also var, const
    export let name1 = …, name2 = …, …, nameN; // also var, const
    export function FunctionName(){...}
    export class ClassName {...}

    // Default
    export default expression;
    export default function (…) { … } // also class, function*
    export default function name1(…) { … } // also class, function*
    export { name1 as default, … };

    // Redirect
    export * from …;
    export { name1, name2, …, nameN } from …;
    export { import1 as name1, import2 as name2, …, nameN } from …;
    export { default } from …;

Esprima AST:

    interface ExportAllDeclaration {
        type: 'ExportAllDeclaration';
        source: Literal;
    }

    interface ExportDefaultDeclaration {
        type: 'ExportDefaultDeclaration';
        declaration: Identifier | BindingPattern | ClassDeclaration | Expression | FunctionDeclaration;
    }

    interface ExportNamedDeclaration {
        type: 'ExportNamedDeclaration';
        declaration: ClassDeclaration | FunctionDeclaration | VariableDeclaration;
        specifiers: ExportSpecifier[];
        source: Literal;
    }

    with

    interface ExportSpecifier {
        type: 'ExportSpecifier';
        exported: Identifier;
        local: Identifier;
    };
*/

/* Import

Syntax:
    import defaultExport from "module-name";
    import * as name from "module-name";
    import { export } from "module-name";
    import { export as alias } from "module-name";
    import { export1 , export2 } from "module-name";
    import { export1 , export2 as alias2 , [...] } from "module-name";
    import defaultExport, { export [ , [...] ] } from "module-name";
    import defaultExport, * as name from "module-name";
    import "module-name";
    var promise = import(module-name);

Esprima AST:

    type ImportDeclaration {
        type: 'ImportDeclaration';
        specifiers: ImportSpecifier[];
        source: Literal;
    }

    with

    interface ImportSpecifier {
        type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier';
        local: Identifier;
        imported?: Identifier;
    }
*/

/* Create an entry in expFuncs for fname */
function addFileToExports(expFuncs, fname) {
    expFuncs[fname] = {
        'default': [],
        'named': {},
        'redirect': []
    };
}

/* Create an entry in impFuncs[fname] for srcFname*/
function addSrcToFile(impFuncs, fname, srcFname) {
    impFuncs[fname][srcFname] = {
        'default': [],
        'named': {},
        'entire': false
    };
}

/* Remove fname's entry in expFuncs */
function rmFileFromExports(expFuncs, fname) {
    delete expFuncs[fname];
}

/* Remove fname's entry in impFuncs */
function rmFileFromImports(impFuncs, fname) {
    delete impFuncs[fname];
}

/* Add a default export to expFuncs

Three cases are handled here:
1. CommonJS, assigning a function to module.exports (module.exports = function f() {};)
3. AMD, when returning a function instead of an object with function being properties
2. ES6 default export
expFuncs[fname]['default'] is a list, the following example illustrates why

Example:
    if (x) {
        module.exports = function f() {};
    } else {
        module.exports = function g() {};
    }

Args:
    expFuncs - A dictionary storing export info with file names being keys
       fname - A string, name of the enclosing file of the export statement
          nd - An ast node, usually of type FunctionDeclaration
*/
function addDefaultExport(expFuncs, fname, nd) {
    if (!(fname in expFuncs))
        addFileToExports(expFuncs, fname);
    expFuncs[fname]['default'].push(nd);
}


/*
To avoid the exported/imported function name colliding with Object Prototype's own properties,
we prepend '$' to exported/imported function name before inserting it into
impFuncs[fname][srcFname]['named'] and expFuncs[fname]['named'].

Example:
    If a developer exports a function called `hasOwnProperty`, it would override
    the `hasOwnProperty` property of impFuncs[fname][srcFname]['named'] when we insert it, and break the code
    Now we have a test for this case, please see tests/import-export/es6/es6-import-hasOwnProperty.js
*/
function mangle(funcName) {
    return '$' + funcName;
}

/*
Since connectEntireImport needs to use exportedName to construct PropVertex,
we need to unmangle exportedName first before using it.
*/
function unmangle(funcName) {
    return funcName.substring(1, funcName.length);
}

/* Add a named export to expFuncs

expFuncs[fname]['named'][exportedName] is an ast node of type "Identifier"
Case 1: export function funcName () { ... }
    exportedName is simply funcName and
    point expFuncs[fname]['named'][exportedName] to 'Identifer' node funcName
Case 2: export { variable1 as name1, variable2 as name2, ...};
    exportedName is name1
    point expFuncs[fname]['named'][exportedName] to 'Identifer' node variable1

Args:
        expFuncs - A dictionary storing export info with file names being keys
           fname - A string, name of the enclosing file of the export statement
           local - An ast node of type 'Identifer'
    exportedName - A string, the name visible to outside
*/
function addNamedExport(expFuncs, fname, local, exportedName) {
    if (!(fname in expFuncs))
        addFileToExports(expFuncs, fname);

    /* Re-assignment warning
    Note that if (exportedName in expFuncs[fname]['named']) doesn't work here,
    because exportedName can be properties of named's prototype,
    for example, 'toString'.
    */
    exportedName = mangle(exportedName);
    if (expFuncs[fname]['named'].hasOwnProperty(exportedName))
        console.log('WARNING: Re-assignment in addNamedExport.');

    expFuncs[fname]['named'][exportedName] = local;
}

/* Add a redirect export to expFuncs

Args:
         expFuncs - A dictionary storing export info with file names being keys
            fname - A string, name of the enclosing file of the export statement
    redirectFnaem - A string, full path to the file being exported
*/
function addRedirectExport(expFuncs, fname, redirectFname) {
    if (!(fname in expFuncs))
        addFileToExports(expFuncs, fname);
    expFuncs[fname]['redirect'].push(redirectFname);
}

/* Add a default import to impFuncs

impFuncs[fname][srcFname]['default'] is a list, please see the following example for why

Example:
    import a from "module";
    import b from "module";

Args:
    impFuncs - A dictionary storing import info with file names being keys
       fname - A string, path of the enclosing file of the import statement
    srcFname - A string, absolute path of the file being imported
      idNode - An ast node of type 'Identifer'
*/
function addDefaultImport(impFuncs, fname, srcFname, idNode) {
    if (!(fname in impFuncs))
        impFuncs[fname] = {};

    if (!(srcFname in impFuncs[fname]))
        addSrcToFile(impFuncs, fname, srcFname);

    impFuncs[fname][srcFname]['default'].push(idNode);
}

/* Add a named import to impFuncs

impFuncs[fname][srcFname]['named'][imported] is a list, please see the following example for why

Example:
    import { x as a } from "module";
    import { x as b } from "module";

Args:
        impFuncs - A dictionary storing import info with file names being keys
           fname - A string, path of the enclosing file of the import statement
        srcFname - A string, absolute path of the file being imported
           local - An ast node of type "Identifier"
    importedName - A string, the original name of imported value
*/
function addNamedImport(impFuncs, fname, srcFname, local, importedName) {
    if (!(fname in impFuncs))
        impFuncs[fname] = {};

    if (!(srcFname in impFuncs[fname]))
        addSrcToFile(impFuncs, fname, srcFname);

    let named = impFuncs[fname][srcFname]['named'];

    /*
    Note that 'if (importedName in named)' doesn't work here,
    because importedName can be properties of named's prototype,
    for example, 'toString'.
    */
    importedName = mangle(importedName);
    if (named.hasOwnProperty(importedName))
        named[importedName].push(local);
    else
        named[importedName] = [local];
}

/* Add a entire import to impFuncs

impFuncs[fname][srcFname]['entire'] is a Boolean
since multiple entire imports are equivalent to any single one of them

Example:
    import * as a from "module";
    import * as b from "module";

Args:
    impFuncs - A dictionary storing import info with file names being keys
       fname - A string, path of the enclosing file of the import statement
    srcFname - A string, absolute path of the file being imported
*/
function addEntireImport(impFuncs, fname, srcFname) {
    if (!(fname in impFuncs))
        impFuncs[fname] = {};

    if (!(srcFname in impFuncs[fname]))
        addSrcToFile(impFuncs, fname, srcFname);

    impFuncs[fname][srcFname]['entire'] = true;
}

/* Add edges from srcFname's default exports to nd in flow graph fg

Args:
    expFuncs - A dictionary storing export info with file names being keys
          fg - A graph, representing the flow graph
    srcFname - A string, full path of the file being imported
      idNode - An ast node of type 'Identifier', storing the alias of the default import

Todo:
    Do we need to handle cases other than nd being of type 'FunctionDeclaration'?
*/
function connectDefaultImport(expFuncs, fg, srcFname, idNode) {
    if (!(srcFname in expFuncs))
        return;
    for (let expr of expFuncs[srcFname]['default']) {
        if (expr.type === 'FunctionDeclaration') {
            fg.addEdge(flowgraph.funcVertex(expr), flowgraph.vertexFor(idNode));
        } else if (expr.type === 'ClassDeclaration' || expr.type === 'ClassExpression') {
            let body = expr.body.body
            for (var i = 0; i < body.length; ++i)
              if (body[i].kind === 'constructor') {
                  fg.addEdge(flowgraph.funcVertex(body[i].value), flowgraph.vertexFor(idNode));
                }
        } else {
          fg.addEdge(flowgraph.vertexFor(expr), flowgraph.vertexFor(idNode));
        }
    }
}

/*
Args:
        expFuncs - A dictionary storing export info with file names being keys
              fg - A graph, representing the flow graph
        srcFname - A string, full path of the file being imported
    importedName - A string, the original name of the identifer being imported
                 - can be used to search expFuncs[srcFame]['named']
*/
function connectNamedImport(expFuncs, fg, srcFname, local, importedName) {
    if (!(srcFname in expFuncs))
        return;

    for (let redirectFname of expFuncs[srcFname]['redirect'])
        connectNamedImport(expFuncs, fg, redirectFname, local, importedName);

    let named = expFuncs[srcFname]['named'];

    /*
    Note that 'if (importedName in named)' doesn't work here,
    because importedName can be properties of named's prototype,
    for example, 'toString'.
    */
    if (!named.hasOwnProperty(importedName))
        return;

    fg.addEdge(flowgraph.vertexFor(named[importedName]), flowgraph.vertexFor(local));
}

function connectEntireImport(expFuncs, fg, srcFname) {
    if (!(srcFname in expFuncs))
        return;

    for (let redirectFname of expFuncs[srcFname]['redirect'])
        connectEntireImport(expFuncs, fg, redirectFname);

    let named = expFuncs[srcFname]['named'];

    for (let exportedName in named)
        fg.addEdge(
            flowgraph.vertexFor(named[exportedName]),
            flowgraph.propVertex({ type: 'Literal', value: unmangle(exportedName) })
        );
}

/* Return the relative import path to the project root directory

Args:
       curPath - A string, path to the current file
    importPath - A string, from source property of 'ImportDeclaration' node

Returns:
    A string, the relative import path to the project root directory
*/
function getRelativePath(curPath, importPath) {
    let relativePath = path.join(curPath, '..', importPath);
    return relativePath + '.js';
}

/* Iterate ast and collect export info into expFuncs

Arguments:
         ast - a ProgramCollection
    expFuncs - A dictionary storing export info with file names being keys
    impFuncs - A dictionary storing import info with file names being keys

Relevant docs:

    interface CallExpression {
        type: 'CallExpression';
        callee: Expression;
        arguments: ArgumentListElement[];
    }

    with

    type ArgumentListElement = Expression | SpreadElement;
*/
function collectExportsImports(ast, expFuncs, impFuncs) {
    for (let i = 0; i < ast.programs.length; i++) {
        let fname = ast.programs[i].attr.filename;

        astutil.visit(ast.programs[i], function (nd) {

            /* -------------- exports -----------------*/

            /* CommonJS
            CommonJS is mostly automatically supported by the ACG algorithm due to its field-based nature
            Here we handle the special case: module.exports = fn
            Function astutil.isModuleExports check if nd is an assignment to module.exports
            */
            if (astutil.isModuleExports(nd)) {
                addDefaultExport(expFuncs, fname, nd.right);
            }

            /* AMD
            Handles: define(function() {return fn;})
            */
            if (astutil.isCallTo(nd, 'define')) {
                // the last argument given to define is a function
                const lastArg = nd.arguments[nd.arguments.length - 1];
                if (!astutil.isFunction(lastArg))
                    return;

                const retVals = astutil.getReturnValues(lastArg);
                for (let retVal of retVals)
                    addDefaultExport(expFuncs, fname, retVal);
            }

            // ES6
            if (nd.type === 'ExportDefaultDeclaration') {
                addDefaultExport(expFuncs, fname, nd.declaration);
            }

            if (nd.type === 'ExportNamedDeclaration') {
                if (nd.source) {
                    const relativeImportPath = getRelativePath(fname, nd.source.value);
                    addRedirectExport(expFuncs, fname, relativeImportPath);
                }
                else if (nd.declaration) {
                    if (nd.declaration.type === 'FunctionDeclaration')
                        addNamedExport(expFuncs, fname, nd.declaration.id, nd.declaration.id.name);
                }
                else
                    for (let specifier of nd.specifiers)
                        addNamedExport(expFuncs, fname, specifier.local, specifier.exported.name);
            }

            if (nd.type === 'ExportAllDeclaration') {
                // TODO
            }

            /* -------------- imports -----------------*/

            // require
            if (nd.type === 'VariableDeclarator') {
                let init = nd.init;

                if (init && astutil.isCallTo(init, 'require')) {
                    let requirePath = init.arguments[0].value;
                    if (requirePath && typeof requirePath === 'string') {
                        const relativeRequirePath = getRelativePath(fname, requirePath);
                        addDefaultImport(impFuncs, fname, relativeRequirePath, nd.id);
                    }
                }
            }

            // import
            if (nd.type === 'ImportDeclaration') {
                const relativeImportPath = getRelativePath(fname, nd.source.value);

                for (var i = 0; i < nd.specifiers.length; i++) {
                    const specifier = nd.specifiers[i];
                    switch (specifier.type) {
                        case 'ImportSpecifier':
                            addNamedImport(impFuncs, fname, relativeImportPath,
                                           specifier.local, specifier.imported.name);
                            break;
                        case 'ImportDefaultSpecifier':
                            addDefaultImport(impFuncs, fname, relativeImportPath, specifier.local);
                            break;
                        case 'ImportNamespaceSpecifier':
                            addEntireImport(impFuncs, fname, relativeImportPath);
                            break;
                    }
                }
            }
        });
    }
}

/*
Args:
          fg - A graph, representing the flow graph
    expFuncs - A dictionary storing export info with file names being keys
    impFuncs - A dictionary storing import info with file names being keys

Postcondition:
    edges connecting imports to the corresponding
    exported value have been added to the flowgraph
*/
function connectImports(fg, expFuncs, impFuncs) {
    // console.log(expFuncs);
    // console.log(impFuncs);
    for (let fname in impFuncs) {
        for (let srcFname in impFuncs[fname]) {
            if (!(srcFname in expFuncs))
                continue;

            let imp = impFuncs[fname][srcFname];

            for (let idNode of imp['default'])
                connectDefaultImport(expFuncs, fg, srcFname, idNode);

            for (let importedName in imp['named'])
                for (let local of imp['named'][importedName])
                    connectNamedImport(expFuncs, fg, srcFname, local, importedName);

            if (imp['entire'])
                connectEntireImport(expFuncs, fg, srcFname);
        }
    }
}

module.exports.rmFileFromExports = rmFileFromExports;
module.exports.rmFileFromImports = rmFileFromImports;
module.exports.collectExportsImports = collectExportsImports;
module.exports.connectImports = connectImports;
