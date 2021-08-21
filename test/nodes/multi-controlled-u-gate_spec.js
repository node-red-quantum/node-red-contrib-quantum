const multiControlledUGateNode = require('../../quantum/nodes/multi-controlled-u-gate/multi-controlled-u-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('MultiControlledUGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(multiControlledUGateNode, 'multi-controlled-u-gate', done);
  });
});
