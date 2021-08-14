const groversAlgoNode = require('../../quantum/nodes/grovers-algo/grovers-algo.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const shell = require('../../quantum/python').PythonShell;


describe('GroversAlgoNode', function() {
  this.timeout(10000);
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(groversAlgoNode, 'grovers-algo', done);
  });

  it('default name outputs correctly', function(done) {
    var flow = [{ id: "groversNode", type: "grovers-algo", wires: []}]
    nodeTestHelper.load(groversAlgoNode, flow, function () {
      var groversNode = nodeTestHelper.getNode("groversNode");
      groversNode.should.have.property('name', "Grover's algorithm");
      done();
    });
  });

  it('return success output on valid input', function(done) {
    var flow = [{ id: "groversNode", type: "grovers-algo", wires: [["helperNode"]]},
      { id: "helperNode", type: "helper" }]
    nodeTestHelper.load(groversAlgoNode, flow, function () {
      var groversNode = nodeTestHelper.getNode("groversNode");
      var helperNode = nodeTestHelper.getNode("helperNode");
      helperNode.on("input", function (msg) {
        const expectedPayload = 'Success!\n' +
          'Top measurement: 111111\n' +
          'iterations = 6';
        try {
          msg.should.have.property('payload', expectedPayload);
          done();
        }
        catch(err){
          done(err);
        }
      });
      groversNode.receive({ payload: "111111" });
    });
  });
});
