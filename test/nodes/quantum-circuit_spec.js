const quantumCircuitNode = require('../../quantum/nodes/quantum-circuit/quantum-circuit.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('QuantumCircuitNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumCircuitNode, 'quantum-circuit', done);
  });
});
