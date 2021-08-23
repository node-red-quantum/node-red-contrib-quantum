const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const unitaryGateNode = require('../../quantum/nodes/unitary-gate/unitary-gate.js');
const snippets = require('../../quantum/snippets.js');

const flow = new FlowBuilder();

describe('UnitaryGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(unitaryGateNode, 'unitary-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('unitary-gate', 'n1', [['n2']], {theta: '1', phi: '1', lambda: '1'});
    flow.addOutput('n2');

    let payloadObject = {
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    };

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.UNITARY_GATE, '0*pi', '0*pi', '0*pi', '0');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('unitary-gate', 'n1', [['n2']], {theta: '0', phi: '0', lambda: '0'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
