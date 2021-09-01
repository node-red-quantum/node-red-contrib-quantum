const util = require('util');
const testUtil = require('../test-util');
const quantumCircuitNode = require('../../nodes/quantum/quantum-circuit/quantum-circuit.js');
const {FlowBuilder} = require('../flow-builder');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

describe('QuantumCircuitNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumCircuitNode, 'quantum-circuit', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.IMPORTS + snippets.QUANTUM_CIRCUIT, '1, 1');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.addOutput('n1');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should return correct output for qubit only circuits', function(done) {
    flow.add('quantum-circuit', 'qc', [['m1'], ['m2'], ['m3']],
      {
        structure: 'qubits',
        outputs: '3',
        qbitsreg: '3',
        cbitsreg: '3'
      });
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('measure', 'm3', [['si']], {selectedBit: 2});
    flow.add('local-simulator', 'si',[['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {
      payload: {
        binaryString: '111'
      }
    };
    const expectedOutput = {'111': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
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

  it('should fail on receiving wrong sized binary string', function(done) {
    flow.add('quantum-circuit', 'qc', [['m1'], ['m2'], ['m3']],
      {
        structure: 'qubits',
        outputs: '3',
        qbitsreg: '3',
        cbitsreg: '3'
      });
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('measure', 'm3', [['si']], {selectedBit: 2});
    flow.add('local-simulator', 'si',[['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {
      payload: {
        binaryString: '1111'
      }
    };
    const expectedMessage = `Binary string length mismatch. Expect: 3, actual: 4`;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving wrong formatted binary string', function(done) {
    flow.add('quantum-circuit', 'qc', [['m1'], ['m2'], ['m3']],
      {
        structure: 'qubits',
        outputs: '3',
        qbitsreg: '3',
        cbitsreg: '3'
      });
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('measure', 'm3', [['si']], {selectedBit: 2});
    flow.add('local-simulator', 'si',[['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {
      payload: {
        binaryString: '112'
      }
    };
    const expectedMessage = `Input should be a binary string`;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });
});
