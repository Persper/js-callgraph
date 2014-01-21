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

/**
 * Implementation of sets of non-negative integers as bitsets.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    // Wegner's algorithm
    function countBitsInWord(w) {
        var cnt = 0;
        while (w) {
            ++cnt;
            w &= w - 1;
        }
        return cnt;
    }

    function countBits(a) {
        var cnt = 0;
        a.forEach(function (w) {
            cnt += countBitsInWord(w);
        });
        return cnt;
    }

    function size(a) {
        if (typeof a === 'undefined')
            return 0;

        if (typeof a === 'number')
            return 1;

        return countBits(a);
    }

    /**
     * Check whether set a contains number x.
     */
    function contains(a, x) {
        if (typeof a === 'undefined')
            return false;

        if (typeof a === 'number')
            return a === x;

        var word_off = x >> 5,
            word_idx = x % 32;

        if (word_off >= a.length)
            return false;

        return !!(a[word_off] & (1 << word_idx));
    }

    function createSingletonBitset(x) {
        var word_off = x >> 5,
            word_idx = x % 32;
        var a = new Array(word_off + 1);
        a[word_off] = (1 << word_idx);
        return a;
    }

    /**
     * Add number x to set a, and return the possibly modified a.
     */
    function add(a, x) {
        if (typeof a === 'undefined')
            return x;

        if (typeof a === 'number')
            a = createSingletonBitset(a);

        var word_off = x >> 5,
            word_idx = x % 32;
        a[word_off] = (a[word_off] || 0) | (1 << word_idx);
        return a;
    }

    /**
     * Add all elements in set b to set a, returning the resulting set.
     * While set a may be modified, set b never is.
     */
    function addAll(a, b) {
        if (typeof a === 'undefined')
            return copy(b);

        if (typeof b === 'undefined')
            return a;

        if (typeof b === 'number')
            return add(a, b);

        if (typeof a === 'number')
            return add(copy(b), a);

        // both a and b must be bitsets
        for (var i = 0; i < b.length; ++i)
            if (b[i])
                a[i] = (a[i] || 0) | b[i];
        return a;
    }

    function remove(a, x) {
        if (typeof a === 'undefined')
            return a;

        if (typeof a === 'number')
            return a === x ? void(0) : a;

        var word_off = x >> 5,
            word_idx = x % 32;
        a[word_off] = (a[word_off] || 0) & ~(1 << word_idx);
        return a;
    }

    function removeAll(a, b) {
        if (typeof a === 'undefined' || typeof b === 'undefined')
            return a;

        if (typeof a === 'number')
            return contains(b, a) ? void(0) : a;

        if (typeof b === 'number')
            return remove(a, b);

        a.forEach(function (w, i) {
            if (b[i])
                a[i] = a[i] & ~b[i];
        });
        return a;
    }

    function copy(a) {
        if (typeof a === 'undefined' || typeof a === 'number')
            return a;

        return a.slice(0);
    }

    function iter(a, cb) {
        if (a) {
            if (typeof a === 'number')
                cb(a);
            else
                a.forEach(function (w, i) {
                    for (var j = 0; j < 32; ++j)
                        if (w & (1 << j))
                            cb(32 * i + j);
                });
        }
    }

    function map(a, f) {
        if (a) {
            if (typeof a === 'number')
                return [f(a)];
            else {
                var res = [];
                iter(a, function (x) {
                    res[res.length] = f(x);
                })
                return res;
            }
        } else {
            return [];
        }
    }

    function some(a, f) {
        if (a) {
            if (typeof a === 'number')
                return f(a);
            else
                for (var i = 0; i < a.length; ++i)
                    if (a[i])
                        for (var j = 0; j < 32; ++j)
                            if (a[i] & (1 << j))
                                if (f(32 * i + j))
                                    return true;
        }
        return false;
    }

    function all(a, f) {
        if (a) {
            if (typeof a === 'number')
                return f(a);
            else
                for (var i = 0; i < a.length; ++i)
                    if (a[i])
                        for (var j = 0; j < 32; ++j)
                            if (a[i] & (1 << j))
                                if (!f(32 * i + j))
                                    return false;
        }
        return true;
    }

    function fromArray(ary) {
        var a;
        ary.forEach(function (x) {
            a = add(a, x);
        });
        return a;
    }

    function toArray(a) {
        return map(a, function f(x) {
            return x;
        });
    }

    exports.copy = copy;
    exports.size = size;
    exports.contains = contains;
    exports.add = add;
    exports.addAll = addAll;
    exports.remove = remove;
    exports.removeAll = removeAll;
    exports.iter = iter;
    exports.map = map;
    exports.some = some;
    exports.all = all;
    exports.fromArray = fromArray;
    exports.toArray = toArray;
    return exports;
});