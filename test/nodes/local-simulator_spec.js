const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const localSimulatorNode = require('../../quantum/nodes/local-simulator/local-simulator.js');
const snippets = require('../../quantum/snippets.js');

const flow = new FlowBuilder();

describe('LocalSimulatorNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(localSimulatorNode, 'local-simulator', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.LOCAL_SIMULATOR, '1');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.add('local-simulator', 'n3', [['n4']], {shots: '1'});
    flow.addOutput('n4');

    testUtil.commandExecuted(flow, command, done);
  });
});
