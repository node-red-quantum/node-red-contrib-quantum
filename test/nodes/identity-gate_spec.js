const identityGateNode = require('../../quantum/nodes/identity-gate/identity-gate.js');
const shell = require('../../quantum/python.js').PythonShell;
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('IdentityGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(identityGateNode, 'identity-gate', done);
  });

  it('pass qubit through gate', function(done) {
    testUtil.qubitsPassedThroughGate('identity-gate', null, done);
  });
});
