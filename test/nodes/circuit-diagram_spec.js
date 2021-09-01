const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const circuitDiagramNode = require('../../nodes/quantum/circuit-diagram/circuit-diagram.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('CircuitDiagramNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(circuitDiagramNode, 'circuit-diagram', done);
  });

  it('execute command', function(done) {
    let command = snippets.CIRCUIT_DIAGRAM + snippets.ENCODE_IMAGE;
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.add('circuit-diagram', 'n3', [['n4']]);
    flow.addOutput('n4');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('circuit-diagram', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('circuit-diagram', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('command executed in register-only circuit', function(done) {
    let command = snippets.CIRCUIT_DIAGRAM + snippets.ENCODE_IMAGE;
    flow.add('quantum-circuit', 'qc', [['qr']],
      {structure: 'registers', outputs: '1', qbitsreg: '1', cbitsreg: '0'});
    flow.add('quantum-register', 'qr', [['cd'],['cd']], {outputs: 2});
    flow.add('circuit-diagram', 'cd', [['out']]);

    flow.addOutput('out');

    testUtil.commandExecuted(flow, command, done);
  });
});
