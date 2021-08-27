const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const xyzGateNode = require('../../nodes/quantum/xyz-gate/xyz-gate.js'); // Replace with the import for the node that is being tested.
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

// REMEMBER TO REMOVE x IN xit BEFORE EACH TEST CASE IN ORDER TO ENABLE TESTS FOR THE NODE.
describe('xyzGateNode', function() { // Replace with the imported node.
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  xit('load node', function(done) {
    // Replace below with the imported node and the name of that node as it appears in registerType of the node's html file.
    testUtil.isLoaded(xyzGateNode, 'xyz-gate', done);
  });

  xit('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1'], ['n1']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'}); // Edit the circuit structure with the appropriate number of bits.
    // Replace line below with the name of that node as it appears in registerType of the node's html file.
    // Use appropriate number of output wires and include any necessary default node properties.
    flow.add('xyz-gate', 'n1', [['n2'], ['n2'], ['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    // Edit the payload object with the appropriate number of qubit objects.
    let payloadObject = [
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 0},
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 1},
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 2},
    ];

    testUtil.qubitsPassedThroughGate(flow, payloadObject, done);
  });

  xit('execute command', function(done) {
    let command = util.format(snippets.XYZ_GATE, '0', '2', '1'); // Replace with the necessary snippet and parameters for executing the node.
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '1'}); // Edit the circuit structure with the appropriate number of bits.
    flow.add('hadamard-gate', 'n1', [['n4']]);
    flow.add('hadamard-gate', 'n2', [['n4']]);
    flow.add('not-gate', 'n3', [['n4']]);
    // Replace below with the name of the node as it appears in registerType of the node's html file
    // and edit the appropriate number of output wires and add any necessary default node properties.
    flow.add('xyz-gate', 'n4', [['n5'], ['n5'], ['n5']], {property: 'Value'});
    flow.addOutput('n5');

    testUtil.commandExecuted(flow, command, done);
  });
});

