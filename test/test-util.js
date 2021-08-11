const assert = require('chai').assert;
const shell = require('../quantum/python').PythonShell;
const nodeTestHelper = require('node-red-node-test-helper');
const quantumCircuitNode = require('../quantum/nodes/quantum-circuit/quantum-circuit.js');

nodeTestHelper.init(require.resolve('node-red'));


function isLoaded(node, nodeName, done) {
  let flow = [{id: '1', type: nodeName, name: nodeName}];

  nodeTestHelper.load(node, flow, function() {
    let node = nodeTestHelper.getNode('1');
    try {
      assert.propertyVal(node, 'name', nodeName);
      done();
    } catch (err) {
      done(err);
    }
  });
}

// Test that qubit was passed to gate
function qubitPassedGate(node, nodeName, done) {
  let flow = [{id: 'n1', type: quantumCircuitNode, name: 'Circuit', structure: 'circuit-structure-qubits', cbitsreg: '1', qbitsreg: '1', wires: [['n2']]},
    {id: 'n2', type: nodeName, name: nodeName, wires: [['n3']]},
    {id: 'n3', type: 'helper'}];

  nodeTestHelper.load(node, flow, function() {
    let gate = nodeTestHelper.getNode('n2');
    let outputNode = nodeTestHelper.getNode('n3');
    try {
      assert.propertyVal(gate, 'payload', 'q1');
      assert.propertyVal(outputNode, 'payload', 'q1');
    } catch (err) {
      done(err);
    }
  });
}

// Test that correct script was passed to the shell by the node.
function qiskitScriptSent(node, nodeName, scriptString, done) {
  let flow = [{id: 'n1', type: quantumCircuitNode, name: 'Circuit', structure: 'circuit-structure-qubits', cbitsreg: '1', qbitsreg: '1', wires: [['n2']]},
    {id: 'n2', type: nodeName, name: nodeName, wires: [['n3']]},
    {id: 'n3', type: 'helper'}];

  nodeTestHelper.load(node, flow, function() {
    let sentScript = shell.returnLastString();
    try {
      assert.equal(sentScript, scriptString);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = {
  nodeTestHelper,
  isLoaded,
  qubitPassedGate,
  qiskitScriptSent,
};
