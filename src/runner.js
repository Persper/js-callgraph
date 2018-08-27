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
        diagnostics = require('./diagnostics'),
        callbackCounter = require('./callbackCounter'),
        requireJsGraph = require('./requireJsGraph'),
        ArgumentParser = require('argparse').ArgumentParser,
        path = require('path'),
        fs = require('fs'),
        utils = require('./utils');
    this.args = null;
    this.files = null;
    this.consoleOutput = null;

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

        args.strategy = args.strategy || 'ONESHOT';
        if (!args.strategy.match(/^(NONE|ONESHOT|DEMAND|FULL)$/)) {
            argParser.printHelp();
            process.exit(-1);
        }
        if (args.strategy === 'FULL') {
            console.warn('strategy FULL not implemented yet; using DEMAND instead');
            args.strategy = 'DEMAND';
        }
        if (args.time) console.time("parsing  ");
        var ast = astutil.buildAST(files);
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

        if (args.fg)
            console.log(cg.fg.dotify());

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
            else if (file.endsWith(".js")) {
                filelist.push(file);
            }
        });
        this.files = Array.from(new Set(filelist));
        if (this.files.length === 0) {
            console.warn("Input file list is empty!");
            argParser.printHelp();
            process.exit(-1);
        }
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