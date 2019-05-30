/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require, exports) {
    const bindings = require('./bindings'),
        astutil = require('./astutil'),
        pessimistic = require('./pessimistic'),
        semioptimistic = require('./semioptimistic'),
        callbackCounter = require('./callbackCounter'),
        requireJsGraph = require('./requireJsGraph'),
        path = require('path'),
        fs = require('fs'),
        utils = require('./utils'),
        JSONStream = require('JSONStream');
    this.args = null;
    this.files = null;
    this.consoleOutput = null;

    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    let addNode = function (edge, v) {
        if (v.type === 'CalleeVertex') {
            let nd = v.call;
            edge.label = astutil.encFuncName(nd.attr.enclosingFunction);
            edge.file = nd.attr.enclosingFile;
            edge.start = {row: nd.loc.start.line, column: nd.loc.start.column};
            edge.end = {row: nd.loc.end.line, column: nd.loc.end.column};
            edge.range = {start: nd.range[0], end: nd.range[1]};
            return edge;
        }
        if (v.type === 'FuncVertex') {
            edge.label = astutil.funcname(v.func);
            edge.file = v.func.attr.enclosingFile;
            edge.start = {row: v.func.loc.start.line, column: v.func.loc.start.column};
            edge.end = {row: v.func.loc.end.line, column: v.func.loc.end.column};
            edge.range = {start: v.func.range[0], end: v.func.range[1]};
            return edge;
        }
        if (v.type === 'NativeVertex') {
            //'Math_log' (Native)
            edge.label = v.name;
            edge.file = "Native";
            edge.start.row = null;
            edge.end.row = null;
            edge.start.column = null;
            edge.end.column = null;
            edge.range = {start: null, end: null};
            return edge;
        }
        throw new Error("strange vertex: " + v);
    };

    let buildBinding = function (call, fn) {
        let edge = {
            source: {
                label: null,
                file: null,
                start: {row: null, column: null},
                end: {row: null, column: null},
                range: {start: null, end: null}
            },
            target: {
                label: null,
                file: null,
                start: {row: null, column: null},
                end: {row: null, column: null},
                range: {start: null, end: null}
            }
        };
        addNode(edge.source, call);
        addNode(edge.target, fn);
        return edge;
    };

    let pp = function (v) {
        if (v.type === 'CalleeVertex')
            return '\'' + astutil.encFuncName(v.call.attr.enclosingFunction) + '\' (' + astutil.ppPos(v.call) + ')';
        if (v.type === 'FuncVertex')
            return '\'' + astutil.funcname(v.func) + '\' (' + astutil.ppPos(v.func) + ')';
        if (v.type === 'NativeVertex')
            return '\'' + v.name + '\' (Native)';
        throw new Error("strange vertex: " + v);
    };

    let build = function () {
        let args = this.args;
        let files = this.files;
        let consoleOutput = this.consoleOutput;

        let filter = this.filter;

        if (filter !== undefined && filter.length > 0) {
            let filteredfiles = [];
            files.forEach(function (file) {
                filteredfiles.push(file);
                filter.forEach(function (elem) {
                    let trunk = elem.substr(1).trim();
                    let expression = new RegExp(trunk, "gm");
                    let result = expression.test(file);

                    if (result && elem.startsWith('-')) {
                        filteredfiles.remove(file);
                    }

                    if (result && elem.startsWith('+')) {
                        filteredfiles.push(file);
                    }

                });
            });
            files = Array.from(new Set(filteredfiles));
        }

        args.strategy = args.strategy || 'ONESHOT';
        if (!args.strategy.match(/^(NONE|ONESHOT|DEMAND|FULL)$/)) {
            process.exit(-1);
        }
        if (args.strategy === 'FULL') {
            console.warn('strategy FULL not implemented yet; using DEMAND instead');
            args.strategy = 'DEMAND';
        }
        if (args.time) console.time("parsing  ");
        var ast = astutil.astFromFiles(files);
        if (args.time) console.timeEnd("parsing  ");

        if (args.time) console.time("bindings ");
        bindings.addBindings(ast);
        if (args.time) console.timeEnd("bindings ");

        if (args.time) console.time("callgraph");
        var cg;
        if (args.strategy === 'NONE' || args.strategy === 'ONESHOT')
            cg = pessimistic.buildCallGraph(ast, args.strategy === 'NONE');
        else if (args.strategy === 'DEMAND')
            cg = semioptimistic.buildCallGraph(ast);
        if (args.time) console.timeEnd("callgraph");

        if (args.fg){
            let serializedGraph = cg.fg.graph.serialize();
            serializedGraph.links.forEach((link) => {
                console.log(link.source, "=>", link.target);
            });
        }

        if (args.countCB)
            callbackCounter.countCallbacks(ast);

        if (args.reqJs)
            requireJsGraph.makeRequireJsGraph(ast).forEach(function (edge) {
                console.log(edge.toString());
            });
        if (args.cg) {
            let result = [];
            cg.edges.iter(function (call, fn) {
                result.push(buildBinding(call, fn));
                if (consoleOutput)
                    console.log(pp(call) + " -> " + pp(fn));
            });
            if (this.args.output !== null) {
                let filename = this.args.output[0];
                if (!filename.endsWith(".json")) {
                    filename += ".json";
                }
                fs.writeFile(filename, JSON.stringify(result, null, 2), function (err) {
                    if (err) {
                        /*
                        When happened something wrong (usually out of memory when we want print
                        the result into a file), then we try to file with JSONStream.
                         */
                        let transformStream = JSONStream.stringify();
                        let outputStream = fs.createWriteStream(filename);
                        transformStream.pipe(outputStream);
                        result.forEach(transformStream.write);
                        transformStream.end();
                    }
                });

            }
            return result;
        }
    };

    exports.setFiles = function (inputList) {
        let filelist = [];
        inputList.forEach(function (file) {
            file = path.resolve(file);
            if (!fs.existsSync(file)) {
                console.warn('The path "' + file + '" does not exists.');
            }
            else if (fs.statSync(file).isDirectory()) {
                filelist = utils.collectFiles(file, filelist);
            }
            else if (file.endsWith(".js") || file.endsWith(".ts") || file.endsWith(".vue")) {
                filelist.push(file);
            }
        });
        this.files = Array.from(new Set(filelist));
        if (this.files.length === 0) {
            console.warn("Input file list is empty!");
            process.exit(-1);
        }
    };

    exports.setFilter = function (filter) {
        this.filter = filter;
    };

    exports.setArgs = function (args) {
        this.args = args;
    };

    exports.setConsoleOutput = function (value) {
        this.consoleOutput = value;
    };

    exports.build = build;
    return exports;
});