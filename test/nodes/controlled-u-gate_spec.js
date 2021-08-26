const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const controlledUGateNode = require('../../nodes/quantum/controlled-u-gate/controlled-u-gate.js');
const snippets = require('../../nodes/snippets.js');


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

  it('execute command', function(done) {
    let command = util.format(snippets.CU_GATE, '0*pi', '0*pi', '0*pi', '0*pi', '1', '0');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1']],
        {structure: 'qubits', outputs: '2', qbitsreg: '2', cbitsreg: '1'});
    flow.add('controlled-u-gate', 'n1', [['n2']],
        {targetPosition: 'Upper', theta: '0', phi: '0', lambda: '0', gamma: '0'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
