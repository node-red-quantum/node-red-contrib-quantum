const assert = require('chai').assert;
const nodeTestHelper = require('node-red-node-test-helper');

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

function correctOutputReceived(flow, givenInput, expectedOutput, done) {
  nodeTestHelper.load(flow.nodes, flow.flow, function() {
    const inputNodeId = flow.flow[0].id;
    const inputNode = nodeTestHelper.getNode(inputNodeId);

    const outputNodeId = flow.flow[flow.flow.length - 1].id;
    const outputNode = nodeTestHelper.getNode(outputNodeId);

    outputNode.on('input', function(msg){
      try {
        assert.deepEqual(msg.payload, expectedOutput);
        done();
      }
      catch(err){
        done(err);
      }
      finally{
        inputNode.shell.stop();
      }
    });
    inputNode.receive(givenInput);
  });
}

module.exports = {
  nodeTestHelper,
  correctOutputReceived,
  isLoaded,
};
