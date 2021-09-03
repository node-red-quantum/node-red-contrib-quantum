const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const blochSphereNode = require('../../nodes/quantum/bloch-sphere/bloch-sphere.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('BlochSphereNode', function() {
  before(function() {
    if (process.platform !== 'linux') {
      // eslint-disable-next-line
      this.skip();
    }
  });

  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(blochSphereNode, 'bloch-sphere', done);
  });

  it('execute command', function(done) {
    let command = snippets.BLOCH_SPHERE + snippets.ENCODE_IMAGE;
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

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('bloch-sphere', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('bloch-sphere', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('command executed in register-only circuit', function(done) {
    let command = snippets.BLOCH_SPHERE + snippets.ENCODE_IMAGE;
    flow.add('quantum-circuit', 'qc', [['qr']],
        {structure: 'registers', outputs: '1', qbitsreg: '1', cbitsreg: '0'});
    flow.add('quantum-register', 'qr', [['bs'], ['bs']], {outputs: 2});
    flow.add('bloch-sphere', 'bs', [['out']]);
    flow.addOutput('out');

    testUtil.commandExecuted(flow, command, done);
  });
});
