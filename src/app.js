const express = require('express');
const bodyParser = require('body-parser');
const bindings = require('./bindings.js');
const astutil = require('./astutil.js');
const semioptimistic = require('./semioptimistic.js');
const graph = require('./graph');
const flowgraph = require('./flowgraph');
const callgraph = require('./callgraph');
const Parser = require('./parsePatch').Parser;
const detectChange = require('./detectChange').detectChange;
const { trackFunctions } = require('./trackFunctions');
const natives = require('./natives');
const prep = require('./srcPreprocessor');
const mod = require('./module');

const app = express();
const jsonParser = bodyParser.json({limit: '1mb'});
// const urlencodedParser = bodyParser.urlencoded({ extended: false});

/* MAYBE A HACK: use global variable gcg to store call graph */
let gcg = initializeCallGraph();
const parser = new Parser();

/*
         fg - a graph.Graph object storing the flow graph
 totalEdits - a dictionary with a function's latest colon format id as key
            -  and that function's total number lines of edits as value
exportFuncs - a dictionary with filenames as keys
            -  and a list of exported values as values
      edges - a graph.Graph object storing the call graph
*/
function initializeCallGraph () {
    const fg = new graph.Graph();
    natives.addNativeFlowEdges(fg);
    return {
        'fg': fg,
        'totalEdits': {},
        'exportFuncs': {},
        'importFuncs': {},
        'edges': null
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

/* Return the colon format id of funcNd

Args:
    funcNd - An ast node of type 'FunctionDeclaration' || 'FunctionExpression' || 'ArrowFunctionExpression'

Example outputs:
    src/app.js:colonformat:73:79
    src/astutils.js:anon:217:222
*/
function colonFormat(funcNd){
    return funcNd.attr.enclosingFile + ':' +
           astutil.funcname(funcNd) + ':' +
           funcNd.loc.start.line + ':' +
           funcNd.loc.end.line + ':' +
           (funcNd.range[1] - funcNd.range[0]);
}

/* Convert call graph to node link format that networkx can read

Example node link format for graph that only has edge ('A', 'B'):

    {
        'directed': True,
        'multigraph': False,
        'links': [{'source': 'A', 'target': 'B'}],
        'nodes': [{'id': 'B', 'num_lines': 10}, {'id': 'A', 'num_lines': 2}]
    }
*/
function NodeLinkFormat (edges, totalEdits={}, defaultNumLines=1) {
    const nodeNameSet = new Set();
    const nlf = { 'directed': true, 'multigraph': false, 'links': [], 'nodes': [] };

    function addNodeToGraph(nodeName) {
        /* There're 3 possibilities for nodeName
        1. A proper colon format id
        2. <filename>:global
        3. Native:<funcname>
        Only case 1. functions can and should be found in totalEdits
        */
        if (!(nodeName in nodeNameSet)) {
            nodeNameSet.add(nodeName);
            if (nodeName in totalEdits)
                nlf.nodes.push({'id': nodeName, 'num_lines': totalEdits[nodeName]});
            else
                nlf.nodes.push({'id': nodeName, 'num_lines': defaultNumLines});
        }
    }

    edges.iter(function (call, fn) {
        const callerName = pp(call);
        const calleeName = pp(fn);
        addNodeToGraph(callerName);
        addNodeToGraph(calleeName);
        nlf.links.push({'source': callerName, 'target': calleeName});
    });

    return nlf;
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

function updateFlowGraph (fg, exportFuncs, importFuncs,
    oldFname, oldSrc, newFname, newSrc) {
    if (oldFname) {
        removeNodesInFile(fg, oldFname);
        mod.rmFileFromExports(exportFuncs, oldFname);
        mod.rmFileFromImports(importFuncs, oldFname);
    }
    if (newFname) {
        const ast = astutil.astFromSrc(newFname, newSrc);
        if (ast !== null) {
          bindings.addBindings(ast);
          mod.collectExportsImports(ast, exportFuncs, importFuncs);
          mod.connectImports(fg, exportFuncs, importFuncs);

          flowgraph.addIntraproceduralFlowGraphEdges(ast, fg);
          semioptimistic.addInterproceduralFlowEdges(ast, fg);
        }
    }
}
/*
Keys in totalEdits are colon format ids from the last commit
Keys in stats['idMap'] are colon format ids from the last commit
Keys in stats['idToLines'] are colon format ids from the latest commit
*/
function updateTotalEdits(totalEdits, stats) {
    let newCf2edits = {};
    let removeSet = new Set();
    // Transfer old edits to new colon format ids
    for (let oldCf in stats['idMap']) {
        const newCf = stats['idMap'][oldCf];

        if (oldCf in totalEdits) {
            removeSet.add(oldCf);
            newCf2edits[newCf] = totalEdits[oldCf];
        }
        else {
            // This could happen if we did not track the file from the very beginning.
            console.log('WARNING: oldCf in idMap but not in totalEdits.');
        }
    }

    // Add new edits
    for (let newCf in stats['idToLines'])
        if (newCf in newCf2edits)
            newCf2edits[newCf] += stats['idToLines'][newCf];
        else
            newCf2edits[newCf] = stats['idToLines'][newCf];

    // Remove old colon format ids that have changed
    for (let oldCf of removeSet)
        delete totalEdits[oldCf];

    // Merge newCf2edits to totalEdits
    Object.assign(totalEdits, newCf2edits);
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
    let forwardAST = null, bckwardAST = null;

    if (oldFname) {
        forwardAST = astutil.astFromSrc(oldFname, oldSrc);
        if (forwardAST !== null) {
          forwardFuncs = astutil.getFunctions(forwardAST);
          forwardStats = detectChange(parser.parse(patch), forwardFuncs);
        }
    }
    if (newFname) {
        bckwardAST = astutil.astFromSrc(newFname, newSrc);
        if (bckwardAST !== null) {
          bckwardFuncs = astutil.getFunctions(bckwardAST);
          bckwardStats = detectChange(parser.invParse(patch), bckwardFuncs);
        }
    }
    if (forwardStats && bckwardStats) {
        stats['idMap'] = trackFunctions(forwardFuncs, bckwardFuncs);
        // Merge forwardStats with bckwardStats
        // Override forwardStats with bckwardStats when they disagree
        // Then remove old colon format ids to avoid storing a function twice
        stats['idToLines'] = Object.assign(forwardStats, bckwardStats);
        for (let oldCf in stats['idMap'])
            // A potential bug here
            delete stats['idToLines'][oldCf];
    }
    else if (forwardStats || bckwardStats){
        stats['idToLines'] = forwardStats || bckwardStats;
    }

    return stats;
}

app.get('/callgraph', function (req, res) {
    gcg.edges = callgraph.extractCG(null, gcg.fg).edges;
    res.json(NodeLinkFormat(gcg.edges, gcg.totalEdits));
});

app.post('/update', jsonParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);

    let oldSrc = req.body.oldSrc,
        newSrc = req.body.newSrc;
    const oldFname = req.body.oldFname,
          newFname = req.body.newFname,
          patch = req.body.patch,
          config = req.body.config;

    // Apply preprocessors to src code
    let prepFailed = false;
    if (config && config.preprocessors) {
        if (oldFname) {
            oldSrc = prep.applyPreps(oldSrc, oldFname, config.preprocessors);
            if (oldSrc === null)
                prepFailed = true;
        }
        if (newFname) {
            newSrc = prep.applyPreps(newSrc, newFname, config.preprocessors);
            if (newSrc === null)
                prepFailed = true;
        }
    }

    if (prepFailed)
        res.json({ 'idToLines': {}, 'idMap': {} });
    else {
        const stats = getChangeStats(oldFname, oldSrc, newFname, newSrc, patch);
        updateTotalEdits(gcg.totalEdits, stats);
        updateFlowGraph(gcg.fg, gcg.exportFuncs, gcg.importFuncs,
            oldFname, oldSrc, newFname, newSrc);
        res.json(stats);
    }
});

app.get('/stats', jsonParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);

    let oldSrc = req.body.oldSrc,
        newSrc = req.body.newSrc;
    const oldFname = req.body.oldFname,
          newFname = req.body.newFname,
          patch = req.body.patch,
          config = req.body.config;

    // Apply preprocessors to src code
    let prepFailed = false;
    if (config && config.preprocessors) {
        if (oldFname) {
            oldSrc = prep.applyPreps(oldSrc, oldFname, config.preprocessors);
            if (oldSrc === null)
                prepFailed = true;
        }
        if (newFname) {
            newSrc = prep.applyPreps(newSrc, newFname, config.preprocessors);
            if (newSrc === null)
                prepFailed = true;
        }
    }

    if (prepFailed)
        res.json({ 'idToLines': {}, 'idMap': {} });
    else {
        const stats = getChangeStats(oldFname, oldSrc, newFname, newSrc, patch);
        res.json(stats);
    }
});

app.post('/reset', function (req, res) {
    gcg = initializeCallGraph();
    res.send('A new graph has been created!');
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), () => console.log(`Simple server listening on port ${app.get('port')}!`));
