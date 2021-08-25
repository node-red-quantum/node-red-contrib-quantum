const scriptNode = require('../../nodes/quantum/script/script.js');
const testUtil = require('../test-util');
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
