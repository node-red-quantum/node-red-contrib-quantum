const circuitDiagramNode = require('../../quantum/nodes/circuit-diagram/circuit-diagram.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('CircuitDiagramNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(circuitDiagramNode, 'circuit-diagram', done);
  });
});
