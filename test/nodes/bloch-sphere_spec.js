const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const blochSphereNode = require('../../quantum/nodes/bloch-sphere/bloch-sphere.js');
const snippets = require('../../quantum/snippets.js');


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

  it('execute command', function(done) {
    let command = snippets.BLOCH_SPHERE + snippets.ENCODE_IMAGE;
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n4']]);
    flow.add('hadamard-gate', 'n2', [['n4']]);
    flow.add('not-gate', 'n3', [['n4']]);
    flow.add('toffoli-gate', 'n4', [['n5'], ['n5'], ['n5']], {targetPosition: 'Middle'});
    flow.add('bloch-sphere', 'n5', [['n6']]);
    flow.addOutput('n6');

    testUtil.commandExecuted(flow, command, done);
  });
});
