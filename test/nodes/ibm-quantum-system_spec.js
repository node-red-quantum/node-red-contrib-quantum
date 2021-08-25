const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const ibmQuantumSystemNode = require('../../nodes/quantum/ibm-quantum-system/ibm-quantum-system.js');
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

// DO NOT COMMIT YOUR API TOKEN!
const API_TOKEN = '';

describe('IBMQuantumSystemNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(ibmQuantumSystemNode, 'ibm-quantum-system', done);
  });

  xit('execute command', function(done) {
    // Disabled for now until we can use GitHub secrets to pass an API key to this test for CI.
    let command = util.format(snippets.IBMQ_SYSTEM_DEFAULT + snippets.IBMQ_SYSTEM_RESULT, API_TOKEN, '1');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.add('ibm-quantum-system', 'n3', [['n4']], {api_token: API_TOKEN,
      preferred_backend: '', preferred_output: ' Results'});
    flow.addOutput('n4');

    testUtil.commandExecuted(flow, command, done);
  }).timeout(180000); // Needs long timeout as it takes awhile for IBM server to respond
});
