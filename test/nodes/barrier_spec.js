const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const barrierNode = require('../../quantum/nodes/barrier/barrier.js');
const snippets = require('../../quantum/snippets.js');


describe('BarrierNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(barrierNode, 'barrier', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.BARRIER, '0, ');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('barrier', 'n1', [['n2']], {outputs: '1'});
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
