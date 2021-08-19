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

// // Test that qubits sucessfully passed through the gate.
// function qubitsPassedThroughGate(nodeName, properties, done) {
//   generatedFlow.add('quantum-circuit', 'n0', ['n1'], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
//   generatedFlow.add(nodeName, 'n1', ['n2'], properties);
//   generatedFlow.addOutput('n2');

//   let payloadObject = {
//     structure: {qubits: 1, cbits: 1},
//     register: undefined,
//     qubit: 0,
//   };

//   console.log(generatedFlow.nodes);

//   nodeTestHelper.load(generatedFlow.nodes, generatedFlow.flow, function() {
//     console.log('HERE 4.0');
//     let n0 = nodeTestHelper.getNode('n0');
//     let n2 = nodeTestHelper.getNode('n2');
//     console.log('HERE 4.0.1');
//     n2.on('input', function(msg) {
//       console.log('HERE 4');
//       try {
//         msg.should.have.property('payload', payloadObject);
//         console.log('HERE 4.1');
//         done();
//       } catch (err) {
//         console.log('HERE 4.2');
//         done(err);
//       }
//     });
//     console.log('HERE 5');
//     n0.receive({payload: ''});
//     console.log('HERE 6');
//   });
//   generatedFlow.reset();
// }

// // Test that correct script was passed to the shell by the node.
// function qiskitScriptSent(node, nodeName, scriptString, done) {
//   let flow = [{id: 'n1', type: quantumCircuitNode, name: 'Circuit', structure: 'circuit-structure-qubits', cbitsreg: '1', qbitsreg: '1', wires: [['n2']]},
//     {id: 'n2', type: nodeName, name: nodeName, wires: [['n3']]},
//     {id: 'n3', type: 'helper'}];

//   nodeTestHelper.load(node, flow, function() {
//     let sentScript = shell.returnLastString();
//     try {
//       assert.equal(sentScript, scriptString);
//       done();
//     } catch (err) {
//       done(err);
//     }
//   });
// }


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
  // qiskitScriptSent,
  // nonQuantumFlow,
};
