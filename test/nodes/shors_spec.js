const shorsNode = require('../../nodes/quantum-algorithms/shors/shors.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('ShorsNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(shorsNode, 'shors', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('shors', 'shorsNode', [[]]);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'shors');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('shors', 'shorsNode', [['helperNode']]);
    flow.addOutput('helperNode');

    const givenInput = {payload: 15};
    const expectedOutput = {
      listOfFactors: '[3, 5]'
    };
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('return error for input less than 3', function(done) {
    flow.add('shors', 'n1', []);

    const givenInput = {payload: 1};
    const expectedMessage = errors.GREATER_THAN_TWO;
    testUtil.nodeFailed(flow, 'n1', givenInput, expectedMessage, done);
  });

  it('return error for even input', function(done) {
    flow.add('shors', 'n1', []);

    const givenInput = {payload: 4};
    const expectedMessage = errors.INPUT_ODD_INTEGER;
    testUtil.nodeFailed(flow, 'n1', givenInput, expectedMessage, done);
  });

  it('return error for non-integer input', function(done) {
    flow.add('shors', 'n1', []);

    const givenInput = {payload: 'a'};
    const expectedMessage = errors.INPUT_AN_INTEGER;
    testUtil.nodeFailed(flow, 'n1', givenInput, expectedMessage, done);
  });
});
