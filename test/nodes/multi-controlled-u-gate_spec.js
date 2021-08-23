const multiControlledUGateNode = require('../../quantum/nodes/multi-controlled-u-gate/multi-controlled-u-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const shell = require('../../quantum/python.js').PythonShell;
const {FlowBuilder} = require('../flow-builder.js');

const flow = new FlowBuilder();

describe('MultiControlledUGateNode', function() {
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
    testUtil.isLoaded(multiControlledUGateNode, 'multi-controlled-u-gate', done);
  });

  xit('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1'], ['n1']], {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('multi-controlled-u-gate', 'n1', [['n2'], ['n2'], ['n2']], {nbControls: '3', targetPosition: '2', theta: '0', phi: '0', lambda: '0', gamma: '0'});
    flow.addOutput('n2');

    let payloadObject = [
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 0,
      },
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 1,
      },
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 2,
      }];

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
