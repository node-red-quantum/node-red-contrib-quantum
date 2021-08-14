const localSimulatorNode = require('../../quantum/nodes/local-simulator/local-simulator.js');
const testUtil = require('../test-util');
const shell = require('../../quantum/python.js').PythonShell;
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const assert = require('chai').assert;


describe('LocalSimulatorNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    shell.stop();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(localSimulatorNode, 'local-simulator', done);
  });

  it('execute script', function(done) {
    const flow = new FlowBuilder();
    flow.addQuantumCircuit('n0', ['n1'], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.addHadamardGate('n1', ['n2']);
    flow.addMeasure('n2', ['n3'], {selectedBit: '0'});
    flow.addLocalSimulator('n3', ['n4'], {shots: '1'});
    flow.addHelper('n4', []);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let n0 = nodeTestHelper.getNode('n0');
      let n4 = nodeTestHelper.getNode('n4');

      n4.on('input', function(msg) {
        try {
          assert.isNotEmpty(msg.payload);
          done();
        } catch (err) {
          done(err);
        }
      });

      n0.receive({payload: ''});
    });
  });
});
