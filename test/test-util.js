const assert = require('chai').assert;
const nodeTestHelper = require('node-red-node-test-helper');
const shell = require('../quantum/python.js').PythonShell;

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

function commandExecuted(flowBuilder, command, done) {
  nodeTestHelper.load(flowBuilder.nodes, flowBuilder.flow, function() {
    let inputNode = nodeTestHelper.getNode(flowBuilder.inputId);
    let outputNode = nodeTestHelper.getNode(flowBuilder.outputId);
    let called = false;

    outputNode.on('input', function() {
      if (called) return;
      try {
        assert.strictEqual(shell.lastCommand, command);
        done();
      } catch (err) {
        done(err);
      } finally {
        shell.stop();
        called = true;
      }
    });

    inputNode.receive({payload: ''});
  });
}

function correctOutputReceived(flow, givenInput, expectedOutput, done) {
  nodeTestHelper.load(flow.nodes, flow.flow, function() {
    const inputNode = nodeTestHelper.getNode(flow.inputId);
    const outputNode = nodeTestHelper.getNode(flow.outputId);
    outputNode.on('input', function(msg) {
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

module.exports = {
  nodeTestHelper,
  isLoaded,
  commandExecuted,
  correctOutputReceived,
};
