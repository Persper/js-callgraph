const graph = require('../src/graph');

const G = new graph.Graph();

const nodes = {};
const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
for (let i = 0; i < names.length; i++) {
	nodes[names[i]] = {'name': names[i], 'attr': {}};
} 

function addEdge(G, name1, name2) {
	G.addEdge(nodes[name1], nodes[name2])
}

function printEdges(G) {
	console.log('----------------');
	G.iter(function (from, to){
		console.log(from.name, to.name);
	});
	console.log('----------------');
}

addEdge(G, 'A', 'B');
addEdge(G, 'A', 'C');
addEdge(G, 'B', 'F');
addEdge(G, 'B', 'G');
addEdge(G, 'D', 'A');
addEdge(G, 'E', 'B');
addEdge(G, 'E', 'G');

console.assert(G.id2node.length === names.length + 1);
console.assert(G.removeNode(nodes['B']));
console.assert(G.id2node.length === names.length + 1);
// Make sure node 'B' has been removed
console.assert(G.id2node[2] === null);
console.assert(!G.hasNode(nodes['B']), 'Graph still has node B!');

console.assert(G.pred[4] === undefined);
console.assert(G.pred[5].length === 1);
console.assert(G.pred[5][0] === 7);

printEdges(G);

addEdge(G, 'A', 'B');
addEdge(G, 'B', 'F');
addEdge(G, 'B', 'G');
addEdge(G, 'E', 'B');

printEdges(G);

console.assert(G.removeInEdges(nodes['B']));

printEdges(G);

console.assert(G.removeOutEdges(nodes['B']));

printEdges(G);

// 'B' still in the graph
console.assert(G.hasNode(nodes['B']));
console.assert(G.removeNode(nodes['B']));
console.assert(G.id2node.length === names.length + 2);
console.assert(!G.hasNode(nodes['B']));

addEdge(G, 'A', 'B');
addEdge(G, 'B', 'F');
addEdge(G, 'B', 'G');
addEdge(G, 'E', 'B');

G.iterNodes(function (nd) {
	G.removeNode(nd);
});

printEdges(G);

for (let i = 1; i < G.id2node.length; ++i) {
	console.assert(G.id2node[i] === null);
	console.assert(G.succ[i] === undefined);
	console.assert(G.pred[i] === undefined);
}
