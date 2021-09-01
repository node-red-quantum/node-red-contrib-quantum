const util = require('util');
const testUtil = require('../test-util');
const quantumRegisterNode = require('../../nodes/quantum/quantum-register/quantum-register.js');
const {FlowBuilder} = require('../flow-builder');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('QuantumRegisterNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumRegisterNode, 'quantum-register', done);
  });

  it('execute quantum circuit command if last register is connected', function(done) {
    let command = util.format(snippets.QUANTUM_REGISTER, '0', '1, "quantum_register"');
    command += util.format(snippets.QUANTUM_CIRCUIT, 'qr0');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'registers', outputs: '1', qbitsreg: '1', cbitsreg: '0'});
    flow.add('quantum-register', 'n1', [['n2']], {outputs: 1});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('quantum-register', 'n1', [[]], {outputs: 2});

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-register object', function(done) {
    flow.add('quantum-register', 'n1', [[]], {outputs: 2});

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_REGISTER_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should return correct output for registers only circuits', function(done) {
    flow.add('quantum-circuit', 'qc', [['qr'], ['cr']],
      {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('classical-register', 'cr', [[]], {classicalBits: '2'});
    flow.add('quantum-register', 'qr', [['m1'], ['m2']], {outputs: 2});
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('local-simulator', 'si', [['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {
      payload: {
        binaryString: '10'
      }
    };
    const expectedOutput = {'10': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
