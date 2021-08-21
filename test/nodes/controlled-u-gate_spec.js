const controlledUGateNode = require('../../quantum/nodes/controlled-u-gate/controlled-u-gate.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;


describe('ControlledUGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(controlledUGateNode, 'controlled-u-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', ['n1'], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('controlled-u-gate', 'n1', [['n2']], {targetPosition: 'Upper', theta: '0', phi: '0', lambda: '0', gamma: '0'});
    flow.addOutput('n2');

    let payloadObject = {
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    };

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });
});
