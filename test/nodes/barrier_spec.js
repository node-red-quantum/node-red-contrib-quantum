const barrierNode = require('../../quantum/nodes/barrier/barrier.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const shell = require('../../quantum/python.js').PythonShell;
const {FlowBuilder} = require('../flow-builder.js');

const flow = new FlowBuilder();

describe('BarrierNode', function() {
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
    testUtil.isLoaded(barrierNode, 'barrier', done);
  });

  xit('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']], {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('hadamard-gate', 'n1', ['n3']);
    flow.add('not-gate', 'n2', ['n3']);
    flow.add('barrier', 'n3', [['n4'], ['n4'], ['n4']], {outputs: '3'});
    flow.addOutput('n4');

    let payloadObject = [{
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

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
