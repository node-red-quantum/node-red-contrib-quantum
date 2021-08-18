const resetNode = require('../../quantum/nodes/reset/reset.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('ResetNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(resetNode, 'reset', done);
  });

  it('pass qubit through node', function(done) {
    testUtil.qubitsPassedThroughGate('reset', null, done);
  });
});
