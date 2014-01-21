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

/* Simple implementation of symbol tables. Uses
 * prototypal inheritance to model scoping. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    function mangle(name) {
        return '$' + name;
    }

    function isMangled(name) {
        return name && name[0] === '$';
    }

    function Symtab(outer) {
        var self = Object.create(outer || Symtab.prototype);
        // every scope has a pointer to its outer scope, which may be null
        self.outer = outer;
        return self;
    }

    Symtab.prototype.get = function (name, deflt) {
        var mangled = mangle(name);
        if (!deflt || this.has(name))
            return this[mangled];
        this[mangled] = deflt;
        return deflt;
    };

    Symtab.prototype.has = function (name) {
        return mangle(name) in this;
    };

    Symtab.prototype.hasOwn = function (name) {
        return this.hasOwnProperty(mangle(name));
    };

    Symtab.prototype.set = function (name, value) {
        return this[mangle(name)] = value;
    };

    Symtab.prototype.values = function () {
        var values = [];
        for (var p in this)
            if (isMangled(p))
                values[values.length] = this[p];
        return values;
    };

    exports.Symtab = Symtab;
    return exports;
});