const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const cnotGateNode = require('../../nodes/quantum/cnot-gate/cnot-gate.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('CnotGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(cnotGateNode, 'cnot-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']],
        {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '2'});
    flow.add('cnot-gate', 'n1', [['n2'], ['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    let payloadObjectList = [
      {structure: {qubits: 2, cbits: 2},
        register: undefined,
        qubit: 0},
      {structure: {qubits: 2, cbits: 2},
        register: undefined,
        qubit: 1},
    ];

    testUtil.qubitsPassedThroughGate(flow, payloadObjectList, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.CNOT_GATE, '1', '0');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']],
        {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '1'});
    flow.add('cnot-gate', 'n1', [['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('cnot-gate', 'n1', [['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('cnot-gate', 'n1', [['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should return correct output', function(done) {
    flow.add('quantum-circuit', 'qc', [['qr'],['cr']],
      {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('quantum-register', 'qr', [['no'],['cn']], {outputs: 2});
    flow.add('classical-register', 'cr', [], {classicalBits: '2'});
    flow.add('not-gate', 'no', [['cn']]);
    flow.add('cnot-gate', 'cn', [['m1'],['m2']], {targetPosition: 'Lower'});
    flow.add('measure', 'm1', [['si']], {selectedBit: '0'});
    flow.add('measure', 'm2', [['si']], {selectedBit: '1'});
    flow.add('local-simulator', 'si', [['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {payload: ''};
    const expectedOutput = {'11': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
