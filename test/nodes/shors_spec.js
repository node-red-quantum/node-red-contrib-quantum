const shorsNode = require('../../nodes/quantum-algorithms/shors/shors.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;

describe('ShorsNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(shorsNode, 'shors', done);
  });

  it('default name outputs correctly', function(done) {
    let flow = [{id: 'shorsNode', name: 'shors', type: 'shors', wires: []}];
    nodeTestHelper.load(shorsNode, flow, function() {
      let shorsTestNode = nodeTestHelper.getNode('shorsNode');
      shorsTestNode.should.have.property('name', 'shors');
      done();
    });
  });
  it('return success output on valid input', function(done) {
    let flow = [{id: 'shorsNode', type: 'shors', wires: [['helperNode']]},
      {id: 'helperNode', type: 'helper'}];

    nodeTestHelper.load(shorsNode, flow, function() {
      let shorsTestNode = nodeTestHelper.getNode('shorsNode');
      let helperNode = nodeTestHelper.getNode('helperNode');
      console.log('loaded here');

      helperNode.on('input', function(msg) {
        const expectedFactors = '[3, 5]';
        try {
          assert.strictEqual(msg.payload.listOfFactors, expectedFactors);
          done();
        } catch (err) {
          done(err);
        }
      });

      shorsTestNode.receive({payload: 15});
    });
  });
});
