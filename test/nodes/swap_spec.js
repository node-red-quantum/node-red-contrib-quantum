const swapNode = require('../../quantum/nodes/swap/swap.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('SwapNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(swapNode, 'swap', done);
  });
});
