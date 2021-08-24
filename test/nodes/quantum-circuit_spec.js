const util = require('util');
const testUtil = require('../test-util');
const quantumCircuitNode = require('../../nodes/quantum/quantum-circuit/quantum-circuit.js');
const {FlowBuilder} = require('../flow-builder');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../nodes/snippets.js');


describe('QuantumCircuitNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumCircuitNode, 'quantum-circuit', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.IMPORTS + snippets.QUANTUM_CIRCUIT, '1, 1');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.addOutput('n1');

    testUtil.commandExecuted(flow, command, done);
  });
});
