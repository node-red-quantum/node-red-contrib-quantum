const blochSphereNode = require('../../quantum/nodes/bloch-sphere/bloch-sphere.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('BlochSphereNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(blochSphereNode, 'bloch-sphere', done);
  });
});
