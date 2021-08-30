const scriptNode = require('../../nodes/quantum/script/script.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const dedent = require('dedent-js');


describe('ScriptNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(scriptNode, 'script', done);
  });

  it('return correct script in valid circuit', function(done) {
    flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('hadamard-gate', 'n1', [['n4']]);
    flow.add('hadamard-gate', 'n2', [['n4']]);
    flow.add('not-gate', 'n3', [['n4']]);
    flow.add('toffoli-gate', 'n4', [['n5'], ['n5'], ['n5']], {targetPosition: 'Middle'});
    flow.add('script', 'n5', [['n6']]);
    flow.addOutput('n6');

    const givenInput = {payload: ''};
    const expectedOutput = dedent(
        `from math import pi
        from qiskit import *
        qc = QuantumCircuit(3, 3)


        qc.h(0)


        qc.h(1)


        qc.x(2)


        qc.toffoli(0, 2, 1)`);
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
