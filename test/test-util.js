const assert = require('chai').assert;
const nodeTestHelper = require('node-red-node-test-helper');
const shell = require('../nodes/python.js').PythonShell;
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
function qubitsPassedThroughGate(generatedFlow, expectedPayloadList, done) {
  nodeTestHelper.load(generatedFlow.nodes, generatedFlow.flow, function() {
    let circuitNode = nodeTestHelper.getNode(generatedFlow.inputId);
    let outputNode = nodeTestHelper.getNode(generatedFlow.outputId);
    let actualPayloadList = [];
    outputNode.on('input', function(msg) {
      try {
        actualPayloadList.push(msg.payload);
        if (actualPayloadList.length === circuitNode.qbitsreg) {
          assert.sameDeepMembers(actualPayloadList, expectedPayloadList);
          done();
        }
      } catch (err) {
        done(err);
      } finally {
        shell.stop();
      }
    });
    circuitNode.receive({payload: ''});
  });
}

function commandExecuted(flowBuilder, command, done) {
  nodeTestHelper.load(flowBuilder.nodes, flowBuilder.flow, function() {
    let inputNode = nodeTestHelper.getNode(flowBuilder.inputId);
    let outputNode = nodeTestHelper.getNode(flowBuilder.outputId);
    outputNode.once('input', function() {
      try {
        assert.strictEqual(shell.lastCommand, command);
        done();
      } catch (err) {
        done(err);
      } finally {
        shell.stop();
      }
    });
    inputNode.receive({payload: ''});
  });
}

function correctOutputReceived(flowBuilder, givenInput, expectedOutput, done) {
  nodeTestHelper.load(flowBuilder.nodes, flowBuilder.flow, function() {
    const inputNode = nodeTestHelper.getNode(flowBuilder.inputId);
    const outputNode = nodeTestHelper.getNode(flowBuilder.outputId);
    outputNode.once('input', function(msg) {
      try {
        assert.deepEqual(msg.payload, expectedOutput);
        done();
      } catch (err) {
        done(err);
      } finally {
        shell.stop();
      }
    });
    inputNode.receive(givenInput);
  });
}

function nodeFailed(flowBuilder, nodeId, givenInput, expectedMessage, done) {
  nodeTestHelper.load(flowBuilder.nodes, flowBuilder.flow, function() {
    let inputNode = nodeTestHelper.getNode(flowBuilder.inputId);
    let targetNode = nodeTestHelper.getNode(nodeId);
    targetNode.on('call:error', (call)=> {
      const actualError = call.firstArg;
      assert.strictEqual(actualError.message, expectedMessage);
      done();
    });
    inputNode.receive(givenInput);
  });
}

module.exports = {
  nodeTestHelper,
  isLoaded,
  qubitsPassedThroughGate,
  commandExecuted,
  correctOutputReceived,
  nodeFailed,
};
