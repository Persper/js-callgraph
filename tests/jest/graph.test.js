/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const graph = require('../../src/graph');

function Node(name) {
  this.name = name;
  this.attr = {};
}

/*
test('TEST FORMAT', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

});
*/

test('Add edge between two nodes and check graph has nodes', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addEdge(nodeA, nodeB);

  expect(G.hasNode(nodeA)).toBe(true);
  expect(G.hasNode(nodeB)).toBe(true);
});

test('Add edge between two nodes and check graph has edge between them', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addEdge(nodeA, nodeB);

  expect(G.hasEdge(nodeA, nodeB)).toBe(true);
});

test('Add edge, remove it and verify it is removed', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addEdge(nodeA, nodeB);

  expect(G.removeEdge(nodeA, nodeB)).toBe(true);

  expect(G.hasEdge(nodeA, nodeB)).toBe(false);
});

test('Add edge, remove one of the nodes and verify it is removed', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addEdge(nodeA, nodeB);

  expect(G.removeNode(nodeB)).toBe(true);

  expect(G.hasNode(nodeB)).toBe(false);
  expect(G.hasEdge(nodeA, nodeB)).toBe(false);
});

test('Add edge and verify the reverse direction edge is not in the graph', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addEdge(nodeA, nodeB);

  expect(G.hasEdge(nodeB, nodeA)).toBe(false);
});

test('Add many edges, remove the nodes and verify they are all removed', () => {
  const G = new graph.Graph();

  var nodes = [];

  for (var i = 0; i < 1000; ++i)
    nodes[i] = new Node( i.toString() );

  for (var i = 0; i < 999; ++i)
    G.addEdge(nodes[i], nodes[i + 1]);

  for (var i = 0; i < 1000; ++i)
    G.removeNode(nodes[i]);

  for (var i = 0; i < 1000; ++i)
    expect(G.hasNode(nodes[i])).toBe(false);

  for (var i = 0; i < 999; ++i)
    expect(G.hasEdge(nodes[i], nodes[i + 1])).toBe(false);
});

test('Add many edges, remove the edges and verify they are all removed', () => {
  const G = new graph.Graph();

  var nodes = [];

  for (var i = 0; i < 1000; ++i)
    nodes[i] = new Node( i.toString() );

  for (var i = 0; i < 999; ++i)
    G.addEdge(nodes[i], nodes[i + 1]);

  for (var i = 0; i < 999; ++i)
    G.removeEdge(nodes[i], nodes[i + 1]);

  for (var i = 0; i < 1000; ++i)
    expect(G.hasNode(nodes[i])).toBe(true);

  for (var i = 0; i < 999; ++i)
    expect(G.hasEdge(nodes[i], nodes[i + 1])).toBe(false);
});

test('Add edges, remove outgoing edges and verify they are removed', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');
  var nodeC = new Node('C');

  G.addEdge(nodeA, nodeB);
  G.addEdge(nodeB, nodeA);

  G.addEdge(nodeA, nodeC);
  G.addEdge(nodeC, nodeA);

  G.addEdge(nodeB, nodeC);
  G.addEdge(nodeC, nodeB);

  expect(G.removeOutEdges(nodeA)).toBe(true);

  expect(G.hasEdge(nodeA, nodeB)).toBe(false);
  expect(G.hasEdge(nodeB, nodeA)).toBe(true);

  expect(G.hasEdge(nodeA, nodeC)).toBe(false);
  expect(G.hasEdge(nodeC, nodeA)).toBe(true);

  expect(G.hasEdge(nodeB, nodeC)).toBe(true);
  expect(G.hasEdge(nodeC, nodeB)).toBe(true);

});

test('Add edges, remove ingoing edges and verify they are removed', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');
  var nodeC = new Node('C');

  G.addEdge(nodeA, nodeB);
  G.addEdge(nodeB, nodeA);

  G.addEdge(nodeA, nodeC);
  G.addEdge(nodeC, nodeA);

  G.addEdge(nodeB, nodeC);
  G.addEdge(nodeC, nodeB);

  expect(G.removeInEdges(nodeA)).toBe(true);

  expect(G.hasEdge(nodeA, nodeB)).toBe(true);
  expect(G.hasEdge(nodeB, nodeA)).toBe(false);

  expect(G.hasEdge(nodeA, nodeC)).toBe(true);
  expect(G.hasEdge(nodeC, nodeA)).toBe(false);

  expect(G.hasEdge(nodeB, nodeC)).toBe(true);
  expect(G.hasEdge(nodeC, nodeB)).toBe(true);
});

test('Add nodes and verify they were added', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');
  var nodeC = new Node('C');

  G.addNode(nodeA);
  G.addNode(nodeB);
  G.addNode(nodeC);

  expect(G.hasNode(nodeA)).toBe(true);
  expect(G.hasNode(nodeB)).toBe(true);
  expect(G.hasNode(nodeC)).toBe(true);
});

test('Add nodes, remove them and verify they were removed', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');
  var nodeC = new Node('C');

  G.addNode(nodeA);
  G.addNode(nodeB);
  G.addNode(nodeC);

  G.removeNode(nodeA);
  G.removeNode(nodeB);
  G.removeNode(nodeC);

  expect(G.hasNode(nodeA)).toBe(false);
  expect(G.hasNode(nodeB)).toBe(false);
  expect(G.hasNode(nodeC)).toBe(false);
});


test('Add nodes, add edge, verify graph has edges and nodes', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

  G.addNode(nodeA);
  G.addNode(nodeB);

  G.addEdge(nodeA, nodeB);

  expect(G.hasNode(nodeA)).toBe(true);
  expect(G.hasNode(nodeB)).toBe(true);

  expect(G.hasEdge(nodeA, nodeB)).toBe(true);
});

test('Add nodes, applies function to all nodes and verifies changes are made', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');
  var nodeC = new Node('C');

  G.addNode(nodeA);
  G.addNode(nodeB);
  G.addNode(nodeC);

  G.iterNodes((nd) => { nd.name = nd.name.toLowerCase(); });

  expect(nodeA.name).toBe('a');
  expect(nodeB.name).toBe('b');
  expect(nodeC.name).toBe('c');
});
