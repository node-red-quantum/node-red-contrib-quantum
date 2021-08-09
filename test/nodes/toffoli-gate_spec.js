const toffoliGateNode = require('../../quantum/nodes/toffoli-gate/toffoli-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('ToffoliGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(toffoliGateNode, 'toffoli-gate', done);
    testUtil.qubitPassedGate(toffoliGateNode, 'toffoli-gate', done);
  });
});
