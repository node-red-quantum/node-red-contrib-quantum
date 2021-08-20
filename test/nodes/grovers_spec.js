const groversNode = require('../../quantum/nodes/grovers/grovers.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const {FlowBuilder} = require('../flow-builder');
const errors = require('../../quantum/errors');


describe('GroversNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(groversNode, 'grovers', done);
  });

  it('default name outputs correctly', function(done) {
    flow = new FlowBuilder();
    flow.add('grovers', 'groversNode', []);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let groversTestNode = nodeTestHelper.getNode('groversNode');
      groversTestNode.should.have.property('name', 'grovers');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow = new FlowBuilder();
    flow.add('grovers', 'groversNode', [['helperNode']]);
    flow.addOutput('helperNode');

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let groversTestNode = nodeTestHelper.getNode('groversNode');
      let helperNode = nodeTestHelper.getNode('helperNode');

      helperNode.on('input', function(msg) {
        const expectedPayload = { topMeasurement: '111111', iterationsNum: 6};
        try {
          assert.strictEqual(msg.payload.topMeasurement, expectedPayload.topMeasurement);
          assert.strictEqual(msg.payload.iterationsNum, expectedPayload.iterationsNum);
          done();
        } catch (err) {
          done(err);
        }
        finally{
          groversTestNode.shell.stop();
        }
      });

      groversTestNode.receive({payload: '111111'});
    });
  });

  it('should fail on invalid input', function(done) {
    flow  = new FlowBuilder();
    flow.add('grovers', 'groversNode', []);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let groversTestNode = nodeTestHelper.getNode('groversNode');
      groversTestNode.on('call:error', call => {
        call.should.be.calledWithExactly(errors.NOT_BIT_STRING);
        done();
      });
      groversTestNode.receive({payload: '111112'});
    });
  });
});
