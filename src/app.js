const express = require('express');
const bodyParser = require('body-parser');
const babel = require('babel-core');
const bindings = require('./bindings.js');
const astutil = require('./astutil.js');
const semioptimistic = require('./semioptimistic.js');
const graph = require('./graph');
const flowgraph = require('./flowgraph');
const callgraph = require('./callgraph');
const Parser = require('./parsePatch').Parser;
const detectChange = require('./detectChange').detectChange;
const { trackFunctions } = require('./trackFunctions');

const app = express();
const jsonParser = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({ extended: false});

/* MAYBE A HACK: use global variable gcg to store call graph */
let gcg = initializeCallGraph();
const parser = new Parser();

function initializeCallGraph () {
    return {
        'fg': new graph.Graph(),
        'totalEdits': {},
        'edges': null,
    };
}

function pp(v) {
    // v is a call graph vertex, which stores a reference to its AST node
    if (v.type === 'CalleeVertex') {
        if (v.call.attr.enclosingFunction)
            return colonFormat(v.call.attr.enclosingFunction);
        else
            return v.call.attr.enclosingFile + ':global'
    }
    else if (v.type === 'FuncVertex') {
        return colonFormat(v.func);
    }
    else if (v.type === 'NativeVertex') {
        return 'Native:' + v.name;
    }
    else {
        throw new Error("strange vertex: " + v);
    }
}

function colonFormat(funcNd){
    // funcNd is an AST node
    // example output: a.js:funcA:1:5
    return funcNd.attr.enclosingFile + ':' +
        astutil.funcname(funcNd) + ':' +
        funcNd.loc.start.line + ':' +
        funcNd.loc.end.line;
}

/* Convert call graph to node link format that networkx can read */
function NodeLinkFormat (edges, totalEdits={}, defaultNumLines=1) {
    let nextId = 0;
    const node2id = {}
    const nlf = { 'directed': true, 'multigraph': false, 'links': [], 'nodes': [] };
    /* Example node link format for graph that only has edge ('A', 'B')
    {
        'directed': True,
        'multigraph': False,
        'links': [{'source': 1, 'target': 0}],
        'nodes': [{'id': 'B', 'num_lines': 10}, {'id': 'A', 'num_lines': 2}]
    }
    */

    function nodeId (nodeName) {
        /* There're 3 possibilities for nodeName
        1. A proper colon format id
        2. <filename>:global
        3. Native:<funcname>
        Only case 1. functions can and should be found in totalEdits
        */
        if (!(nodeName in node2id)) {
            node2id[nodeName] = nextId++;
            if (nodeName in totalEdits)
                nlf.nodes.push({'id': nodeName, 'num_lines': totalEdits[nodeName]});
            else
                nlf.nodes.push({'id': nodeName, 'num_lines': defaultNumLines});
        }
        return node2id[nodeName]
    }

    edges.iter(function (call, fn) {
        const callerId = nodeId(pp(call));
        const calleeId = nodeId(pp(fn));
        nlf.links.push({'source':  callerId, 'target': calleeId});
    })
    return nlf;
}

function simpleCallGraph () {
    const files = ['tests/basics/assignment.js'];
    const ast = astutil.buildAST(files);
    bindings.addBindings(ast);
    return semioptimistic.buildCallGraph(ast);
}

/* Get enclosingFile of a node in flow graph by querying its associated AST node */
function getEnclosingFile (nd) {
    if (nd.hasOwnProperty('node')) {
        return nd.node.attr.enclosingFile;
    } else if (nd.hasOwnProperty('call')) {
        return nd.call.attr.enclosingFile;
    } else if (nd.hasOwnProperty('func')) {
        return nd.func.attr.enclosingFile;
    } else {
        // Native, Prop and Unknown vertices
        return null;
    }
}

function removeNodesInFile(fg, fname) {
    fg.iterNodes(function (nd) {
        if (getEnclosingFile(nd) === fname)
            fg.removeNode(nd);
    });
}

function stripAndTranspile(src) {
    return babel.transform(src, {
        presets: ['es2015', 'flow'],
        retainLines: true,
    });
}

function stripFlow(src) {
    return babel.transform(src, {
        presets: ['flow'],
        retainLines: true,
    });
}

function updateFlowGraph (fg, oldFname, oldSrc, newFname, newSrc) {
    if (oldFname) {
        removeNodesInFile(fg, oldFname);
    }
    if (newFname) {
        const ast = astutil.singleSrcAST(newFname, newSrc, stripAndTranspile);
        bindings.addBindings(ast);
        flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
        semioptimistic.addInterproceduralFlowEdges(ast, fg);
    }
}

function updateTotalEdits (totalEdits, stats) {
    for (let cf in stats['idToLines']) {
        // if cf is changed
        if (cf in stats['idMap']) {
            let newCf = stats['idMap'][cf];
            if (newCf in stats['idMap'])
                console.log('WARNING: newCf already exists in totalEdits.');
            // if cf in stats['idMap'], it should exist in totalEdits
            totalEdits[newCf] = totalEdits[cf] + stats['idToLines'][cf];
            delete totalEdits[cf];
        }
        else {
            if (cf in totalEdits)
                totalEdits[cf] += stats['idToLines'][cf];
            else
                totalEdits[cf] = stats['idToLines'][cf];
        }
    }
}

/*
This function does two things:
1. Extract function level edit info by parsing source files and their diff.
2. Return a mapping between a function's old colon format ID to its new colon format ID.
The mapping is empty if no function's colon format ID gets changed
or either of oldFname and newFname is null.
*/
function getChangeStats (oldFname, oldSrc, newFname, newSrc, patch) {
    let stats = { 'idToLines': {}, 'idMap': {} };
    let forwardStats = null, bckwardStats = null;
    let forwardFuncs = null, bckwardFuncs = null;

    if (oldFname) {
        const ast = astutil.singleSrcAST(oldFname, oldSrc, stripFlow);
        forwardFuncs = astutil.getFunctions(ast);
        forwardStats = detectChange(parser.parse(patch), forwardFuncs);
    }
    if (newFname) {
        const ast = astutil.singleSrcAST(newFname, newSrc, stripFlow);
        bckwardFuncs = astutil.getFunctions(ast);
        bckwardStats = detectChange(parser.invParse(patch), bckwardFuncs);
    }

    if (oldFname && newFname) {
        stats['idMap'] = trackFunctions(forwardFuncs, bckwardFuncs);
        // Merge forwardStats with bckwardStats
        // Override bckwardStats with forwardStats when they disagree
        // Then remove new colon format ids to avoid storing a function twice
        stats['idToLines'] = Object.assign(bckwardStats, forwardStats);
        for (let newCf of Object.values(stats['idMap']))
            delete stats['idToLines'][newCf];
    }
    else {
        stats['idToLines'] = forwardStats || bckwardStats;
    }

    return stats;
}

app.get('/callgraph', function (req, res) {
    if (gcg.edges) {
        res.json(NodeLinkFormat(gcg.edges, gcg.totalEdits));
    } else {
        res.json(NodeLinkFormat(simpleCallGraph().edges));
    }
});

app.post('/update', jsonParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    // console.log(req.body)
    const oldFname = req.body.oldFname,
          oldSrc = req.body.oldSrc,
          newFname = req.body.newFname,
          newSrc = req.body.newSrc,
          patch = req.body.patch;

    const stats = getChangeStats(oldFname, oldSrc, newFname, newSrc, patch)
    updateTotalEdits(gcg.totalEdits, stats);

    updateFlowGraph(gcg.fg, oldFname, oldSrc, newFname, newSrc);
    gcg.edges = callgraph.extractCG(null, gcg.fg).edges;
    res.json(stats);
});

app.get('/stats', jsonParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    // console.log(req.body);
    const oldFname = req.body.oldFname,
          oldSrc = req.body.oldSrc,
          newFname = req.body.newFname,
          newSrc = req.body.newSrc,
          patch = req.body.patch;
    const stats = getChangeStats(oldFname, oldSrc, newFname, newSrc, patch);
    res.json(stats);
});

app.post('/reset', function (req, res) {
    gcg = initializeCallGraph();
    res.send('A new graph has been created!');
});


app.listen(3000, () => console.log('Simple server listening on port 3000!'));