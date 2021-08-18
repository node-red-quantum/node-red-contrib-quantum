const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const toffoliGateNode = require('../../quantum/nodes/toffoli-gate/toffoli-gate.js');
const snippets = require('../../quantum/snippets.js');


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
});
