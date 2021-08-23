const swapNode = require('../../quantum/nodes/swap/swap.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const shell = require('../../quantum/python.js').PythonShell;
const {FlowBuilder} = require('../flow-builder.js');

const flow = new FlowBuilder();

describe('SwapNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(swapNode, 'swap', done);
  });

  xit('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']], {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '2'});
    flow.add('swap', 'n1', [['n2'], ['n2']]);
    flow.addOutput('n2');

    let payloadObject = [
      {structure: {qubits: 2, cbits: 2},
        register: undefined,
        qubit: 0},
      {structure: {qubits: 2, cbits: 2},
        register: undefined,
        qubit: 1},
    ];

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
