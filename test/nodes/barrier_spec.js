const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const barrierNode = require('../../nodes/quantum/barrier/barrier.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('BarrierNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(barrierNode, 'barrier', done);
  });

  it('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('hadamard-gate', 'n1', [['n3']]);
    flow.add('not-gate', 'n2', [['n3']]);
    flow.add('barrier', 'n3', [['n4'], ['n4'], ['n4']], {outputs: '3'});
    flow.addOutput('n4');

    let payloadObjectList = [{
      structure: {qubits: 3, cbits: 3},
      register: undefined,
      qubit: 0,
    }, {
      structure: {qubits: 3, cbits: 3},
      register: undefined,
      qubit: 1,
    }, {
      structure: {qubits: 3, cbits: 3},
      register: undefined,
      qubit: 2,
    }];

    testUtil.qubitsPassedThroughGate(flow, payloadObjectList, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.BARRIER, '0, ');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('barrier', 'n1', [['n2']], {outputs: '1'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('barrier', 'n1', [['n2']], {outputs: '1'});
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('barrier', 'n1', [['n2']], {outputs: '1'});
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should return correct output', function(done) {
    flow.add('quantum-circuit', 'qc', [['qr'], ['cr']],
        {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('classical-register', 'cr', [[]], {classicalBits: '2'});
    flow.add('quantum-register', 'qr', [['ba'], ['ba']], {outputs: 2});
    flow.add('barrier', 'ba', [['m1'], ['m2']], {outputs: 2});
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('local-simulator', 'si', [['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {payload: ''};
    const expectedOutput = {'00': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
