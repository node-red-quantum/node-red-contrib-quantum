const qubitNode = require('../../quantum/nodes/qubit/qubit.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('QubitNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(qubitNode, 'qubit', done);
  });

  it('pass qubit through node', function(done) {
    testUtil.qubitsPassedThroughGate('qubit', null, done);
  });
});
