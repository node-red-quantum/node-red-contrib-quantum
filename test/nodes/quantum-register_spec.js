const quantumRegisterNode = require('../../quantum/nodes/quantum-register/quantum-register.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('QuantumRegisterNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumRegisterNode, 'quantum-register', done);
  });
});
