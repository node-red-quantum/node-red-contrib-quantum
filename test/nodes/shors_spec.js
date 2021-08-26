const shorsNode = require('../../nodes/quantum-algorithms/shors/shors.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

describe('ShorsNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  xit('load node', function(done) {
    testUtil.isLoaded(shorsNode, 'shors', done);
  });

  xit('default name outputs correctly', function(done) {
    flow = new FlowBuilder();
    flow.add('shors', 'shorsNode', [[]]);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'shors');
      done();
    });
  });
  it('return success output on valid input', function(done) {
    flow = new FlowBuilder();
    flow.add('shors', 'shorsNode', [['helperNode']]);
    flow.addOutput('helperNode');

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      let outputNode = nodeTestHelper.getNode(flow.outputId);

      outputNode.on('input', function(msg) {
        const expectedFactors = '[3, 5]';
        try {
          assert.strictEqual(msg.payload.listOfFactors, expectedFactors);
          done();
        } catch (err) {
          done(err);
        }
      });

      inputNode.receive({payload: 15});
    });
  });

  it('return error for input less than 3', function(done){
    flow = new FlowBuilder();
    flow.add('shors', 'shorsNode', []);

    nodeTestHelper.load(flow.nodes, flow.flow,  function(){
      let shorsTestNode = nodeTestHelper.getNode('shorsNode');
      shorsTestNode.on('call:error', (call)=> {
        const actualError = call.firstArg;
        assert.strictEqual(actualError.message, errors.GREATER_THAN_TWO);
        done();
      });
      shorsTestNode.receive({payload: 1});
    })
  });

  it('return error for even input', function(done){
    flow = new FlowBuilder();
    flow.add('shors', 'shorsNode', []);

    nodeTestHelper.load(flow.nodes, flow.flow,  function(){
      let shorsTestNode = nodeTestHelper.getNode('shorsNode');
      shorsTestNode.on('call:error', (call)=> {
        const actualError = call.firstArg;
        assert.strictEqual(actualError.message, errors.INPUT_ODD_INTEGER);
        done();
      });
      shorsTestNode.receive({payload: 4});
    })
  });

  it('return error for non-integer input', function(done){
    flow = new FlowBuilder();
    flow.add('shors', 'shorsNode', []);

    nodeTestHelper.load(flow.nodes, flow.flow,  function(){
      let shorsTestNode = nodeTestHelper.getNode('shorsNode');
      shorsTestNode.on('call:error', (call)=> {
        const actualError = call.firstArg;
        assert.strictEqual(actualError.message, errors.INPUT_AN_INTEGER);
        done();
      });
      shorsTestNode.receive({payload: 'a'});
    })
  });
});
