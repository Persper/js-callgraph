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

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports) {
    var Graph = require('./graph').Graph,
        numset = require('./numset');

    Graph.prototype.reachability = function (nodePred) {
        var self = this;
        var next_dfsnum = 1, next_component = 1;
        var ccr = [],
            component = [],
            dfsnum = [],
            vstack = [],
            cstack = [],
            reach = [],
            members = [];

        function visit(v) {
            var cstack_height = cstack.length,
                vstack_height = vstack.length,
                self_loop = false;
            vstack[vstack.length] = v;
            ccr[v] = v;
            component[v] = 0;
            dfsnum[v] = next_dfsnum++;

            if (!nodePred || nodePred(self.id2node[v]))
                numset.iter(self.succ[v], function (w) {
                    if (w === v) {
                        self_loop = true;
                    } else {
                        var w_visited = !!dfsnum[w];

                        if (!w_visited)
                            visit(w);

                        if (!component[w]) {
                            if (dfsnum[ccr[w]] < dfsnum[ccr[v]])
                                ccr[v] = ccr[w];
                        } else if (!w_visited || dfsnum[w] < dfsnum[v]) {
                            cstack[cstack.length] = component[w];
                        }
                    }
                });

            if (ccr[v] === v) {
                var comp = component[v] = next_component++;

                if (self_loop || vstack[vstack.length - 1] !== v)
                    reach[comp] = comp;
                else
                    reach[comp] = void(0);

                for (var i = cstack.length - 1; i >= cstack_height; --i) {
                    var x = cstack[i];
                    if (!numset.contains(reach[comp], x))
                        reach[comp] = numset.add(numset.addAll(reach[comp], reach[x]), x);
                }
                cstack.length = cstack_height;

                do {
                    w = vstack[vstack.length - 1];
                    --vstack.length;
                    component[w] = comp;
                    members[comp] = numset.add(members[comp], w);
                } while (w !== v);
            }
        }

        return {
            getReachable: function (src) {
                var src_id = self.nodeId(src);
                if (!dfsnum[src_id])
                    visit(src_id);

                var res = [];
                numset.iter(reach[component[src_id]], function (r) {
                    numset.iter(members[r], function (id) {
                        res[res.length] = self.id2node[id];
                    });
                });
                return res;
            },
            iterReachable: function (src, cb) {
                debugger;
                var src_id = self.nodeId(src);
                if (!dfsnum[src_id])
                    visit(src_id);

                numset.iter(reach[component[src_id]], function (r) {
                    numset.iter(members[r], function (id) {
                        cb(self.id2node[id]);
                    });
                });
            },
            reaches: function (src, dest) {
                var src_id = self.nodeId(src), dest_id = self.nodeId(dest);
                if (!dfsnum[src_id])
                    visit(src_id);

                var found = false;
                numset.iter(reach[component[src_id]], function (r) {
                    if (numset.contains(members[r], dest_id)) {
                        found = true;
                        return true;
                    }
                });
                return found;
            }
        };
    };

    return exports;
});