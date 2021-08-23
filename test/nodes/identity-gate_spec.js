const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const identityGateNode = require('../../nodes/quantum/identity-gate/identity-gate.js');
const snippets = require('../../nodes/snippets.js');


describe('IdentityGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(identityGateNode, 'identity-gate', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.IDENTITY, '0');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('identity-gate', 'n1', [['n2']]);
    flow.addOutput('n2');

    testUtil.commandExecuted(flow, command, done);
  });
});
