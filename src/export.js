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
const path = require('path');
const imp = require('./import');

/*
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

/* Create an entry in expFuncs for fname */
function addFileToExports(expFuncs, fname) {
    expFuncs[fname] = {
        'default': [],
        'named': {},
        'redirect': []
    };
}

/* Remove fname's entry in expFuncs */
function rmFileFromExports(expFuncs, fname) {
    delete expFuncs[fname];
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

    // Re-assignment warning
    if (exportedName in expFuncs[fname]['named'])
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

/* Iterate ast and collect export info into expFuncs

Arguments:
         ast - a ProgramCollection
    expFuncs - A dictionary storing export info with file names being keys

Returns: updated expFuncs
*/
function collectExports(ast, expFuncs) {
    for (let i = 0; i < ast.programs.length; i++) {
        let fname = ast.programs[i].attr.filename;
        fname  = path.resolve(fname);

        astutil.visit(ast.programs[i], function (nd) {
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
                let retVals = astutil.getReturnValues(nd.arguments[nd.arguments.length - 1]);

                for (let retVal of retVals)
                    addDefaultExport(expFuncs, fname, retVal);
            }

            // ES6
            if (nd.type === 'ExportDefaultDeclaration') {
                addDefaultExport(expFuncs, fname, nd.declaration);
            }

            if (nd.type === 'ExportNamedDeclaration') {
                if (nd.source) {
                    let fullImportPath = imp.getFullImportPath(fname, nd.source.value);
                    addRedirectExport(expFuncs, fname, fullImportPath);
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
        });
    }
    return expFuncs;
}

module.exports.collectExports = collectExports;
module.exports.rmFileFromExports = rmFileFromExports;
