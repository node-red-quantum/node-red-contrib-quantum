const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const multiControlledUGateNode = require('../../quantum/nodes/multi-controlled-u-gate/multi-controlled-u-gate.js');
const snippets = require('../../quantum/snippets.js');


describe('MultiControlledUGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(multiControlledUGateNode, 'multi-controlled-u-gate', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.MULTI_CONTROLLED_U_GATE, '0*pi', '0*pi', '0*pi', '1', '[ 1, 0 ]');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']],
        {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '1'});
    flow.add('multi-controlled-u-gate', 'n1', [['n2'], ['n2']],
        {outputs: '2', nbControls: '1', targetPosition: '0', theta: '0', phi: '0', lambda: '0'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
