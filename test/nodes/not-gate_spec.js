const notGateNode = require('../../quantum/nodes/not-gate/not-gate.js');
const shell = require('../../quantum/python.js').PythonShell;
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('NotGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(notGateNode, 'not-gate', done);
  });

  it('pass qubit through gate', function(done) {
    testUtil.qubitsPassedThroughGate('not-gate', null, done);
  });
});
