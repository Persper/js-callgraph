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

const app = express();
const jsonParser = bodyParser.json();
// const urlencodedParser = bodyParser.urlencoded({ extended: false});

/* MAYBE A HACK: use global variable gcg to store call graph */
let gcg = initializeCallGraph();
const parser = new Parser();

function initializeCallGraph () {
    return { fg: new graph.Graph() };
}

function pp(v) {
    if (v.type === 'CalleeVertex')
        return astutil.en_funcname(v.call.attr.enclosingFunction) + ' (' + astutil.ppPos(v.call) + ')';
    if (v.type === 'FuncVertex')
        return astutil.funcname(v.func) + ' (' + astutil.ppPos(v.func) + ')';
    if (v.type === 'NativeVertex')
        return v.name + ' (Native)';
    throw new Error("strange vertex: " + v);
}



/* Convert call graph to node link format that networkx can read */
function NodeLinkFormat (G) {
    let nextId = 0;
    const node2id = {}
    const nlf = { 'directed': true, 'multigraph': false, 'links': [], 'nodes': [] };
    /* Example node link format for graph that only has edge ('A', 'B')
    {
        'directed': True,
        'multigraph': False,
        'links': [{'source': 1, 'target': 0}],
        'nodes': [{'id': 'B'}, {'id': 'A'}]
    }
    */

    function nodeId (nodeName) {
        if (!(nodeName in node2id)) {
            node2id[nodeName] = nextId++;
            nlf.nodes.push({'id': nodeName});
        }
        return node2id[nodeName]
    }

    G.iter(function (call, fn) {
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
        // sourceMaps: true
    });
}

function stripFlow(src) {
    return babel.transform(src, {
        presets: ['flow'],
        retainLines: true,
        // sourceMaps: true
    });
}

function updateFlowGraph (fg, oldFname, oldSrc, newFname, newSrc, patch) {
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

async function getChangeStats (oldFname, oldSrc, newFname, newSrc, patch) {
    let forwardStats = null, bckwardStats = null;
    if (oldFname) {
        const ast = astutil.singleSrcAST(oldFname, oldSrc, stripFlow);
        const funcs = await astutil.getFunctions(ast);
        forwardStats = detectChange(parser.parse(patch), funcs);
    }
    if (newFname) {
        const ast = astutil.singleSrcAST(newFname, newSrc, stripFlow);
        const funcs = await astutil.getFunctions(ast);
        bckwardStats = detectChange(parser.invParse(patch), funcs);
    }
    // Override bckwardStats with forwardStats when they disagree
    if (forwardStats && bckwardStats)
        return Object.assign(bckwardStats, forwardStats);
    else
        return forwardStats || bckwardStats;
}

/*
app.get('/', function (req, res) {
    const cg = simpleCallGraph();
    let count = 0;
    cg.edges.iter(function (call, fn) {
        count += 1;
        console.log(pp(call) + ' -> ' + pp(fn));
    });
    res.send(count.toString());
});
*/

app.get('/callgraph', function (req, res) {
    if (!gcg.edges) {
        res.json(NodeLinkFormat(simpleCallGraph().edges));
    } else {
        res.json(NodeLinkFormat(gcg.edges));
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

    updateFlowGraph(gcg.fg, oldFname, oldSrc, newFname, newSrc, patch);
    gcg = callgraph.extractCG(null, gcg.fg);
    res.json(NodeLinkFormat(gcg.edges));
});

app.get('/stats', jsonParser, async function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    // console.log(req.body);
    const oldFname = req.body.oldFname,
          oldSrc = req.body.oldSrc,
          newFname = req.body.newFname,
          newSrc = req.body.newSrc,
          patch = req.body.patch;
    res.json(await getChangeStats(oldFname, oldSrc, newFname, newSrc, patch));
});

app.post('/reset', function (req, res) {
    gcg = initializeCallGraph();
    res.send('A new graph has been created!');
});


app.listen(3000, () => console.log('Simple server listening on port 3000!'));