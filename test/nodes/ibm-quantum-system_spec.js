const ibmQuantumSystemNode = require('../../quantum/nodes/ibm-quantum-system/ibm-quantum-system.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('IBMQuantumSystemNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(ibmQuantumSystemNode, 'ibm-quantum-system', done);
  });
});
