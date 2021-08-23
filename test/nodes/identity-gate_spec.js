const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const identityGateNode = require('../../quantum/nodes/identity-gate/identity-gate.js');
const snippets = require('../../quantum/snippets.js');

const flow = new FlowBuilder();

describe('IdentityGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(identityGateNode, 'identity-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('identity-gate', 'n1', [['n2']]);
    flow.addOutput('n2');

    let payloadObject = {
      structure: {qubits: 1, cbits: 1},
      register: undefined,
      qubit: 0,
    };

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.IDENTITY, '0');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('identity-gate', 'n1', [['n2']]);
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
