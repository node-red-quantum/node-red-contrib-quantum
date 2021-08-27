const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const multiControlledUGateNode = require('../../nodes/quantum/multi-controlled-u-gate/multi-controlled-u-gate.js');
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

describe('MultiControlledUGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(multiControlledUGateNode, 'multi-controlled-u-gate', done);
  });

  xit('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1'], ['n1']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('multi-controlled-u-gate', 'n1', [['n2'], ['n2'], ['n2']],
        {nbControls: '3', targetPosition: '2', theta: '0', phi: '0', lambda: '0', gamma: '0'});
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

  it('execute command', function(done) {
    let command = util.format(snippets.MULTI_CONTROLLED_U_GATE, '0*pi', '0*pi', '0*pi', '1', '[ 1, 0 ]');
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']],
        {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '1'});
    flow.add('multi-controlled-u-gate', 'n1', [['n2'], ['n2']],
        {outputs: '2', nbControls: '1', targetPosition: '0', theta: '0', phi: '0', lambda: '0'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
