/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/**
 * Facade module implementing sets of non-negative integers.
 * Allows to easily switch to a different implementation.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    // var impl = require('./olist');
    var impl = require('./set');

    for (var p in impl)
        exports[p] = impl[p];

    return exports;
});
