/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/* Module for converting a graph into DOT format. */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var graph = require('./graph'),
        fs = require('fs');

    graph.Graph.prototype.dotify = function () {
        var res = "";
        res += "digraph FG {\n";
        this.iter(function (from, to) {
            res += '  "' + from.attr.pp() + '" -> "' + to.attr.pp() + '";\n';
        });
        res += "}\n";
        return res;
    };

    graph.Graph.prototype.writeDOTFile = function (fn) {
        fs.writeFileSync(fn, this.dotify());
    };

    return exports;
});
