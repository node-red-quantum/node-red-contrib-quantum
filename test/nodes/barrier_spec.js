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

  it('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', ['n1'], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('barrier', 'n1', ['n2']);
    flow.addOutput('n2');

    let payloadObject = {
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    };

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
