/*******************************************************************************
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

const graph = require('../../src/graph');
const flowgraph = require('../../src/flowgraph');
const astutil = require('../../src/astutil');
/*
test('TEST FORMAT', () => {
  const G = new graph.Graph();

  var nodeA = new Node('A');
  var nodeB = new Node('B');

});
*/

fn1 = {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "f",
                "range": [
                    9,
                    10
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                }
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [],
                "range": [
                    13,
                    15
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 13
                    },
                    "end": {
                        "line": 1,
                        "column": 15
                    }
                }
            },
            "generator": false,
            "expression": false,
            "async": false,
            "range": [
                0,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        }
fn2 = {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "g",
                "range": [
                    10,
                    11
                ],
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 9
                    },
                    "end": {
                        "line": 2,
                        "column": 10
                    }
                }
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [],
                "range": [
                    14,
                    16
                ],
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 13
                    },
                    "end": {
                        "line": 2,
                        "column": 15
                    }
                }
            },
            "generator": false,
            "expression": false,
            "async": false,
            "range": [
                1,
                16
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            }
        }

fn3 = {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "h",
                "range": [
                    11,
                    12
                ],
                "loc": {
                    "start": {
                        "line": 3,
                        "column": 9
                    },
                    "end": {
                        "line": 3,
                        "column": 10
                    }
                }
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [],
                "range": [
                    15,
                    17
                ],
                "loc": {
                    "start": {
                        "line": 3,
                        "column": 13
                    },
                    "end": {
                        "line": 3,
                        "column": 15
                    }
                }
            },
            "generator": false,
            "expression": false,
            "async": false,
            "range": [
                2,
                17
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 15
                }
            }
        }

fn1.attr = {}
fn2.attr = {}
fn3.attr = {}

fn_vertex1 = flowgraph.funcVertex(fn1);
fn_vertex2 = flowgraph.funcVertex(fn2);
fn_vertex3 = flowgraph.funcVertex(fn3);

fv1 = fn_vertex1;
fv2 = fn_vertex2;
fv3 = fn_vertex3;

test('Add edge between two nodes and check graph has nodes', () => {
  const G = new graph.Graph();

  G.addEdge(fv1, fv2);

  expect(G.hasNode(fv1)).toBe(true);
  expect(G.hasNode(fv2)).toBe(true);
});

test('Add edge between two nodes and check graph has edge between them', () => {
  const G = new graph.Graph();

  G.addEdge(fv1, fv2);

  expect(G.hasEdge(fv1, fv2)).toBe(true);
});

test('Add edge, remove it and verify it is removed', () => {
  const G = new graph.Graph();

  G.addEdge(fv1, fv2);

  expect(G.removeEdge(fv1, fv2)).toBe(true);

  expect(G.hasEdge(fv1, fv2)).toBe(false);
});

test('Add edge, remove one of the nodes and verify it is removed', () => {
  const G = new graph.Graph();

  G.addEdge(fv1, fv2);

  expect(G.removeNode(fv2)).toBe(true);

  expect(G.hasNode(fv2)).toBe(false);
  expect(G.hasEdge(fv1, fv2)).toBe(false);
});

test('Add edge and verify the reverse direction edge is not in the graph', () => {
  const G = new graph.Graph();

  G.addEdge(fv1, fv2);

  expect(G.hasEdge(fv2, fv1)).toBe(false);
});

test('Add many edges, remove the nodes and verify they are all removed', () => {
  const G = new graph.Graph();

  var nodes = [];

  function make_pp(s) {
    return function() {
      return 'Func(' + s + ')'
    }
  }

  for (var i = 0; i < 1000; ++i)
    nodes[i] = {
      'name': i.toString(),
      'type': 'FuncVertex',
      'attr': {pp: make_pp(i.toString())  },
    };

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

  function make_pp(s) {
    return function() {
      return 'Func(' + s + ')'
    }
  }

  for (var i = 0; i < 1000; ++i)
    nodes[i] = {
      'name': i.toString(),
      'type': 'FuncVertex',
      'attr': {pp: make_pp(i.toString())  },
    };

  for (var i = 0; i < 999; ++i)
    G.addEdge(nodes[i], nodes[i + 1]);

  for (var i = 0; i < 999; ++i)
    G.removeEdge(nodes[i], nodes[i + 1]);

  for (var i = 0; i < 1000; ++i)
    expect(G.hasNode(nodes[i])).toBe(true);

  for (var i = 0; i < 999; ++i)
    expect(G.hasEdge(nodes[i], nodes[i + 1])).toBe(false);
});

test('Add nodes and verify they were added', () => {
  const G = new graph.Graph();

  G.addNode(fv1);
  G.addNode(fv2);
  G.addNode(fv3);

  expect(G.hasNode(fv1)).toBe(true);
  expect(G.hasNode(fv2)).toBe(true);
  expect(G.hasNode(fv3)).toBe(true);
});

test('Add nodes, remove them and verify they were removed', () => {
  const G = new graph.Graph();

  G.addNode(fv1);
  G.addNode(fv2);
  G.addNode(fv3);

  G.removeNode(fv1);
  G.removeNode(fv2);
  G.removeNode(fv3);

  expect(G.hasNode(fv1)).toBe(false);
  expect(G.hasNode(fv2)).toBe(false);
  expect(G.hasNode(fv3)).toBe(false);
});

test('Add nodes, add edge, verify graph has edges and nodes', () => {
  const G = new graph.Graph();

  G.addNode(fv1);
  G.addNode(fv2);

  G.addEdge(fv1, fv2);

  expect(G.hasNode(fv1)).toBe(true);
  expect(G.hasNode(fv2)).toBe(true);

  expect(G.hasEdge(fv1, fv2)).toBe(true);
});

test('Add nodes, applies function to all nodes and verifies changes are made', () => {
  const G = new graph.Graph();

  G.addNode(fv1);
  G.addNode(fv2);
  G.addNode(fv3);

  G.iterNodes((nd) => { nd.func.id.name = nd.func.id.name.toLowerCase(); });

  expect(fv1.func.id.name).toBe('f');
  expect(fv2.func.id.name).toBe('g');
  expect(fv3.func.id.name).toBe('h');
});
