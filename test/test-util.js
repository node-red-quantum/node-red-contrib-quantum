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

module.exports = {
  nodeTestHelper,
  isLoaded,
};
