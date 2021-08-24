const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const measureNode = require('../../quantum/nodes/measure/measure.js');
const snippets = require('../../quantum/snippets.js');


describe('MeasureNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(measureNode, 'measure', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.MEASURE, '0, 0');
    let flow = new FlowBuilder();
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.addOutput('n3');

    testUtil.commandExecuted(flow, command, done);
  });
});
