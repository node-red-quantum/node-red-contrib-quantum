const qubitNode = require('../../nodes/quantum/qubit/qubit.js');
const testUtil = require('../test-util');
const {FlowBuilder} = require('../flow-builder.js');
const nodeTestHelper = testUtil.nodeTestHelper;
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('QubitNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(qubitNode, 'qubit', done);
  });

  it('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('qubit', 'n1', [['n2']]);
    flow.addOutput('n2');

    let payloadObjectList = [{
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    }];

    testUtil.qubitsPassedThroughGate(flow, payloadObjectList, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('qubit', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, 'n1', givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('qubit', 'n1', [['n2']]);
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, 'n1', givenInput, expectedMessage, done);
  });
});
