const testUtil = require('../test-util');
const qubitNode = require('../../quantum/nodes/qubit/qubit.js');
const {FlowBuilder} = require('../flow-builder.js');
const nodeTestHelper = testUtil.nodeTestHelper;

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

    let payloadObject = {
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    };

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
