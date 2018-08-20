/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/*
 * Keep the interface of ./olist.js, but use ES6 Set under the hood
 */

function size(s) {
    if (typeof s === 'undefined')
        return 0;

    if (typeof s === 'number')
        return 1;

    return s.size;
}

/* Check whether set s contains number n */
function contains(s, n) {
    if (typeof s === 'undefined')
        return false;

    if (typeof s === 'number')
        return s === n;

    return s.has(n);
}

/* Add number n to set s, and return the possibly modified s */
function add(s, n) {
    if (typeof s === 'undefined')
        return n;

    if (typeof s === 'number')
        return new Set([s, n]);

    s.add(n);
    return s;
}

/*
 * Add all elements in set s2 to set s1, return the resulting set
 * While set s1 may be modified, set s2 never is.
 */
function addAll(s1, s2) {
    if (typeof s1 === 'undefined')
        return copy(s2);

    if (typeof s2 === 'undefined')
        return s1;

    if (typeof s1 === 'number' && typeof s2 === 'number') {
        return new Set([s1, s2]);
    }
    else if (typeof s1 === 'number' && typeof s2 === 'object') {
        return new Set([s1, ...s2]);
    }
    else if (typeof s1 === 'object' && typeof s2 === 'number') {
        s1.add(s2);
        return s1;
    }
    else {
        for (let n of s2)
            s1.add(n);
        return s1
    }
}

/*
 * Remove number n from set s and return the modified set
 * Pitfall: this remove is inplace for array, not inplace for number
 */
function remove(s, n) {
    if (typeof s === 'undefined')
        return s;

    if (typeof s === 'number')
        return s === n ? void(0) : s;

    s.delete(n)
    return s;
}

/*
 * Remove all elements in set s2 from set s1, return the resulting set
 */
function removeAll(s1, s2) {
    if (typeof s1 === 'undefined' || typeof s2 === 'undefined')
        return s1;

    if (typeof s1 === 'number')
        return contains(s2, s1) ? void(0) : s1;

    if (typeof s2 === 'number') {
        s1.delete(s2);
        return s1;
    }

    for (let n of s2)
        s1.delete(n);

    if (s1.size === 0)
        return void(0);
    else
        return s1;
}

function copy(s) {
    if (typeof s === 'undefined' || typeof s === 'number')
        return s;

    // Return a shallow clone of the original set s
    return new Set(s);
}

function iter(s, cb) {
    if (typeof s !== 'undefined') {
        if (typeof s === 'number')
            cb(s);
        else
            s.forEach(cb);
    }
}

function map(s, f) {
    if (typeof s !== 'undefined') {
        if (typeof s === 'number')
            return [f(s)];
        else {
            return Array.from(s).map(f);
        }
    }
    else {
        return [];
    }
}

function fromArray(ary) {
    return new Set(ary);
}

function toArray(s) {
    if (typeof s === 'undefined')
        return []

    if (typeof s === 'number')
        return [s]

    return Array.from(s);
}

module.exports.size = size;
module.exports.copy = copy;
module.exports.contains = contains;
module.exports.add = add;
module.exports.addAll = addAll;
module.exports.remove = remove;
module.exports.removeAll = removeAll;
module.exports.iter = iter;
module.exports.map = map;
module.exports.fromArray = fromArray;
module.exports.toArray = toArray;

