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
 * A simple, incorrect transitive closure algorithm. Mostly does the
 * right thing, unless complicated connected components are involved.
 * Very fast.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var numset = require('./numset'),
        Graph = require('./graph').Graph;

    Graph.prototype.reachability = function (nodePred) {
        var self = this;
        var tc = [], touched = [];

        function computeTC(src_id) {
            if (src_id in tc) {
                touched[src_id] = true;
                return tc[src_id];
            }

            tc[src_id] = src_id;
            if (nodePred && !nodePred(self.id2node[src_id]))
                return tc[src_id];

            do {
                var oldsz = numset.size(tc[src_id]);
                touched[src_id] = false;
                numset.iter(self.succ[src_id], function (succ) {
                    tc[src_id] = numset.addAll(tc[src_id], computeTC(succ));
                });
            } while (oldsz < numset.size(tc[src_id]) && touched[src_id]);
            return tc[src_id];
        }

        return {
            getReachable: function (src) {
                var src_id = self.nodeId(src);
                computeTC(src_id);
                return numset.map(tc[src_id], function (dest_id) {
                    return self.id2node[dest_id];
                });
            },
            iterReachable: function (src, cb) {
                var src_id = self.nodeId(src);
                computeTC(src_id);
                numset.iter(tc[src_id], function (dest_id) {
                    cb(self.id2node[dest_id]);
                });
            }
        };
    };

    return exports;
});