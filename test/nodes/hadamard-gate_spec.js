const hadamardGateNode = require('../../quantum/nodes/hadamard-gate/hadamard-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const shell = require('../../quantum/python.js').PythonShell;

describe('HadamardGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(hadamardGateNode, 'hadamard-gate', done);
  });

  it('pass qubit through gate', function(done) {
    testUtil.qubitsPassedThroughGate('hadamard-gate', null, done);
  });
});
