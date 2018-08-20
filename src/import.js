/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const flowgraph = require('./flowgraph');
const astutil = require('./astutil');
const path = require('path');

/*
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

/* Create an entry in impFuncs[fname] for srcFname*/
function addSrcToFile(impFuncs, fname, srcFname) {
    impFuncs[fname][srcFname] = {
        'default': [],
        'named': {},
        'entire': false
    };
}

/* Remove fname's entry in impFuncs */
function rmFileFromImports(fname, impFuncs) {
    delete impFuncs[fname];
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

    if (importedName in named)
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
        if (expr.type === 'FunctionDeclaration')
            fg.addEdge(flowgraph.funcVertex(expr), flowgraph.vertexFor(idNode));
        else
            fg.addEdge(flowgraph.vertexFor(expr), flowgraph.vertexFor(idNode));
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

    if (!(importedName in named))
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
            flowgraph.propVertex({ type: 'Literal', value: exportedName })
        );
}

/*
Args:
    curr_filename - full path of the file calling require
               nd - ast node representing call to require

Return value: full path of file being required

Relevant docs:

    interface CallExpression {
        type: 'CallExpression';
        callee: Expression;
        arguments: ArgumentListElement[];
    }

    with

    type ArgumentListElement = Expression | SpreadElement;
*/
function getRequiredFile(curr_filename, nd) {
    let argument = nd.arguments[0].value;
    if (argument === undefined) {
        return
    }
    // Question and potential TODO
    // What would happen if argument is not "./define-module"?
    let required_file = argument.slice(2);
    required_file = path.resolve(curr_filename, '..', required_file);
    return required_file + '.js';
}

/*
Args:
    curr_filename - path to the current file
               nd - An ast node of "Literal" type
                  - (from source property of ImportDeclaration node)

Returns:
    A string, full path of the file being imported

Todo:
    Add more test cases for path resolution

*/
function getFullImportPath(curPath, importPath) {
    let fullImportPath = path.resolve(curPath, '..', importPath);
    return fullImportPath + '.js';
}


/*
Args:
           ast - a ProgramCollection
      impFuncs - A dictionary storing import info with file names being keys

Returns: updated impFuncs
*/
function collectImports(ast, impFuncs) {
    for (var i = 0; i < ast.programs.length; i++) {
        let fname = ast.programs[i].attr.filename;

        astutil.visit(ast.programs[i], function (nd) {
            // require
            if (nd.type === 'VariableDeclarator') {
                let init = nd.init;

                if (init && astutil.isCallTo(init, 'require')) {
                    let required_file = getRequiredFile(fname, init);
                    addDefaultImport(impFuncs, fname, required_file, nd.id);
                }
            }

            // import
            if (nd.type === 'ImportDeclaration') {
                let fullImportPath = getFullImportPath(fname, nd.source.value);

                for (var i = 0; i < nd.specifiers.length; i++) {
                    let specifier = nd.specifiers[i];
                    switch (specifier.type) {
                        case 'ImportSpecifier':
                            addNamedImport(impFuncs, fname, fullImportPath,
                                           specifier.local, specifier.imported.name);
                            break;
                        case 'ImportDefaultSpecifier':
                            addDefaultImport(impFuncs, fname, fullImportPath, specifier.local);
                            break;
                        case 'ImportNamespaceSpecifier':
                            addEntireImport(impFuncs, fname, fullImportPath);
                            break;
                    }
                }
            }
        });
    }
    return impFuncs;
}


/*
Args:
          fg - A graph, representing the flow graph
    impFuncs - A dictionary storing import info with file names being keys
    expFuncs - A dictionary storing export info with file names being keys

Postcondition:
    edges connecting imports to the corresponding
    exported value have been added to the flowgraph
*/
function connectImports(fg, impFuncs, expFuncs) {
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

module.exports.collectImports = collectImports;
module.exports.connectImports = connectImports;
module.exports.rmFileFromImports = rmFileFromImports;
module.exports.getFullImportPath = getFullImportPath;
