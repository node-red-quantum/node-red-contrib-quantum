const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const rotationGateNode = require('../../nodes/quantum/rotation-gate/rotation-gate.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('RotationGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(rotationGateNode, 'rotation-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('rotation-gate', 'n1', [['n2']], {axis: 'x', angle: '1'});
    flow.addOutput('n2');

    let payloadObjectList = [{
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    }];

    testUtil.qubitsPassedThroughGate(flow, payloadObjectList, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.ROTATION_GATE, 'x', '-0.2*pi', 0);
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('rotation-gate', 'n1', [['n2']], {axis: 'x', angle: '-0.2'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('rotation-gate', 'n1', [['n2']], {axis: 'x', angle: '-0.2'});
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('rotation-gate', 'n1', [['n2']], {axis: 'x', angle: '-0.2'});
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should return correct output for registers only circuit', function(done) {
    flow.add('quantum-circuit', 'qc', [['qr'], ['cr']],
      {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('classical-register', 'cr', [[]], {classicalBits: '2'});
    flow.add('quantum-register', 'qr', [['ng'], ['m2']], {outputs: 2});
    flow.add('rotation-gate', 'ng', [['m1']], {axis: 'x', angle: '1'});
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('local-simulator', 'si', [['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {payload: ''};
    const expectedOutput = {'01': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
