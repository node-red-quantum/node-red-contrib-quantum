const testUtil = require('../test-util');
const scriptNode = require('../../quantum/nodes/script/script.js');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('ScriptNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(scriptNode, 'script', done);
  });
});
