const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const toffoliGateNode = require('../../nodes/quantum/toffoli-gate/toffoli-gate.js');
const snippets = require('../../nodes/snippets.js');


describe('ToffoliGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(toffoliGateNode, 'toffoli-gate', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.TOFFOLI_GATE, '0', '2', '1');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n4']]);
    flow.add('hadamard-gate', 'n2', [['n4']]);
    flow.add('not-gate', 'n3', [['n4']]);
    flow.add('toffoli-gate', 'n4', [['n5'], ['n5'], ['n5']], {targetPosition: 'Middle'});
    flow.addOutput('n5');

    testUtil.commandExecuted(flow, command, done);
  });
});
