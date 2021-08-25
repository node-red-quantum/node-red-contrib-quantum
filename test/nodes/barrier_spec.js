const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const barrierNode = require('../../nodes/quantum/barrier/barrier.js');
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

describe('BarrierNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(barrierNode, 'barrier', done);
  });

  xit('pass qubit through node', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('hadamard-gate', 'n1', [['n3']]);
    flow.add('not-gate', 'n2', [['n3']]);
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

  it('execute command', function(done) {
    let command = util.format(snippets.BARRIER, '0, ');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('barrier', 'n1', [['n2']], {outputs: '1'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
