const assert = require('chai').assert;
const shell = require('../quantum/python').PythonShell;
const nodeTestHelper = require('node-red-node-test-helper');
// const quantumCircuitNode = require('../quantum/nodes/quantum-circuit/quantum-circuit.js');
// const {FlowBuilder} = require('./flow-builder.js');

// const generatedFlow = new FlowBuilder();

nodeTestHelper.init(require.resolve('node-red'));

// Test that node is successfully loaded into Node-RED.
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

// Test that qubits sucessfully passed through the gate.
function qubitsPassedThroughGate(generatedFlow, expectedPayload, done) {
  nodeTestHelper.load(generatedFlow.nodes, generatedFlow.flow, function() {
    let inputNode = nodeTestHelper.getNode(generatedFlow.inputId);
    let outputNode = nodeTestHelper.getNode(generatedFlow.outputId);

    outputNode.on('input', function(msg) {
      try {
        msg.should.have.property('payload', expectedPayload);
        done();
      } catch (err) {
        done(err);
      }
    });
    inputNode.receive({payload: ''});
  });
}


// Test that using gates without quantum circuit node throws an error.
// function nonQuantumFlow(node, nodeName, done) {
//   let flow = [{id: 'n1', type: 'helper'},
//     {id: 'n2', type: nodeName, name: nodeName, wires: [['n3']]},
//     {id: 'n3', type: 'helper'}];

//   nodeTestHelper.load(node, flow, function() {

//   });
// }


module.exports = {
  nodeTestHelper,
  isLoaded,
  qubitsPassedThroughGate,
  // nonQuantumFlow,
};
