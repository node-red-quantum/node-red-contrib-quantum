const util = require('util');
const testUtil = require('../test-util');
const quantumRegisterNode = require('../../nodes/quantum/quantum-register/quantum-register.js');
const {FlowBuilder} = require('../flow-builder');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

describe('QuantumRegisterNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(quantumRegisterNode, 'quantum-register', done);
  });

  xit('execute command', function(done) {
    // Test is disabled until issue #87 is fixed
    let command = util.format(snippets.QUANTUM_REGISTER, '0', '1, "quantum_register"');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'registers', outputs: '1', qbitsreg: '1', cbitsreg: '0'});
    flow.add('quantum-register', 'n1', [['n2']]);
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
