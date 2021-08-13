const toffoliGateNode = require('../../quantum/nodes/toffoli-gate/toffoli-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../quantum/snippets');


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
  });

  it('sends the correct Qiskit script to the shell', function(done) {
    testUtil.qiskitScriptSent(toffoliGateNode, 'toffoli-gate', snippets.TOFFOLI_GATE, done);
  });
});
