/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/* Name bindings for lexical variables. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var astutil = require('./astutil'),
        symtab = require('./symtab');

    function addBindings(ast) {
        var global_scope = new symtab.Symtab();
        global_scope.global = true;
        var scope = global_scope;
        var decl_scope = scope;
        astutil.visitWithState(ast,
            function enter(nd, doVisit, state) {
                switch (nd.type) {
                    case 'FunctionDeclaration':
                        /* This check is needed for:
                                export function () { ... }
                           as it will not have an id but will be
                           a FunctionDeclaration in ES6 */
                        if (nd.id) {
                          decl_scope.set(nd.id.name, nd.id);
                          doVisit(nd.id);
                        }
                    // FALL THROUGH
                    case 'FunctionExpression':
                    case 'ArrowFunctionExpression':
                        var old_decl_scope = decl_scope;
                        scope = decl_scope = new symtab.Symtab(scope);
                        scope.global = false;

                        nd.attr.scope = scope;
                        if (( nd.type === 'FunctionExpression' ||
                              nd.type === 'ArrowFunctionExpression' ) && nd.id) {
                            decl_scope.set(nd.id.name, nd.id);
                            doVisit(nd.id);
                        }
                        // Put params into symbol table
                        decl_scope.set('this',
                            {
                                type: 'Identifier',
                                name: 'this',
                                loc: nd.loc,
                                range: nd.range,
                                attr: {
                                    enclosingFile: nd.attr.enclosingFile,
                                    scope: decl_scope
                                }
                            }
                        );

                        state['withinParams'] = true;
                        for (var i = 0; i < nd.params.length; ++i) {
                            // Handle identifer as before
                            if (nd.params[i].type === 'Identifier')
                                decl_scope.set(nd.params[i].name, nd.params[i]);

                            // Always visit nd.params[i]
                            // Case 1: If nd.params[i] is an Identifer, visit it to set its scope attribute
                            // Case 2: If nd.params[i] is not an Identifer, visit it to set decl_scope
                            doVisit(nd.params[i]);
                        }
                        state['withinParams'] = false;

                        doVisit(nd.body);

                        // restore previous scope
                        if (!decl_scope.hasOwn('arguments'))
                            decl_scope.set('arguments',
                                {
                                    type: 'Identifier',
                                    name: 'arguments',
                                    loc: nd.loc,
                                    range: nd.range,
                                    attr: {
                                        enclosingFile: nd.attr.enclosingFile,
                                        scope: decl_scope
                                    }
                                }
                            );
                        scope = scope.outer;
                        decl_scope = old_decl_scope;

                        return false;

                    case 'CatchClause':
                        scope = new symtab.Symtab(scope);
                        scope.global = false;
                        scope.set(nd.param.name, nd.param);

                        doVisit(nd.param);
                        doVisit(nd.body);

                        scope = scope.outer;
                        return false;

                    case 'Identifier':
                    case 'ThisExpression':
                        nd.attr.scope = decl_scope;
                        break;

                    case 'MemberExpression':
                        /*
                        If computed === true,
                        the node corresponds to a computed e1[e2] expression
                        and property is an Expression.
                        If computed === false,
                        the node corresponds to a static e1.x expression
                        and property is an Identifier.
                        */
                        doVisit(nd.object);
                        if (nd.computed)
                            doVisit(nd.property);
                        return false;

                    case 'VariableDeclarator':
                        // If nd.id is an Identifer and its name hasn't been declared in the scope, set its name in the scope
                        // Re-declaration of a variable in the same scope is ignored
                        if (nd.id.type === 'Identifier' && !decl_scope.hasOwn(nd.id.name))
                            decl_scope.set(nd.id.name, nd.id);

                        // visit both nd.id and nd.init
                        // nd.id
                        //     Case 1: If nd.id is an Identifer, visit it and set its scope attribute
                        //     Case 2: If nd.id is a BindingPattern, visit it to extract declarations
                        // nd.init might contain function expression
                        state['withinDeclarator'] = true;
                        doVisit(nd.id)
                        doVisit(nd.init)
                        state['withinDeclarator'] = false;
                        return false;

                    case 'ObjectPattern':
                        // ES6 Object Destructuring
                        // { key: value }
                        // The newly declared name is always in value
                        // Haven't tested with rest and default params

                        // Only visit this node if it's
                        // within VariableDeclarator or
                        // within params
                        for (let prop of nd.properties) {
                            if ((state['withinDeclarator'] || state['withinParams']) &&
                                prop.value.type === 'Identifier' &&
                                !decl_scope.hasOwn(prop.value.name))
                                decl_scope.set(prop.value.name, prop.value);

                            doVisit(prop.value);
                        }
                        return false;

                    case 'ArrayPattern':
                        // ES6 Array Destructuring
                        // Haven't tested with rest and default params

                        // Only visit this node if it's
                        // within VariableDeclarator or
                        // within params
                        for (let elm of nd.elements) {
                            // Array destructuring can ignore some values, so check null first
                            if (elm) {
                                if ((state['withinDeclarator'] || state['withinParams']) &&
                                    elm.type === 'Identifier' &&
                                    !decl_scope.hasOwn(elm.name))
                                    decl_scope.set(elm.name, elm);

                                doVisit(elm);
                            }
                        }
                        return false;

                    case 'Property':
                        // Temporary fix for computed property names
                        // visit nd.key to avoid scope of identifer in computed property names being undefined
                        doVisit(nd.key);
                        doVisit(nd.value);
                        return false;
                }
            });
    }

    exports.addBindings = addBindings;
    return exports;
});
