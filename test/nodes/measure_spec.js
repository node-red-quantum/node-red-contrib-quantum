const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const measureNode = require('../../nodes/quantum/measure/measure.js');
const snippets = require('../../nodes/snippets.js');

const flow = new FlowBuilder();

describe('MeasureNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(measureNode, 'measure', done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.MEASURE, '0, 0');
    flow.add('quantum-circuit', 'n0', [['n1']], {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.addOutput('n3');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should return correct output', function(done) {
    let flow = new FlowBuilder();

    flow.add('quantum-circuit', 'n0', [['n1']],
        {structure: 'qubits', outputs: '1', qbitsreg: '1', cbitsreg: '1'});
    flow.add('not-gate', 'n1', [['n2']]);
    flow.add('measure', 'n2', [['n3']], {selectedBit: '0'});
    flow.add('local-simulator', 'n3', [['n4']], {shots: 1});
    flow.addOutput('n4');

    const givenInput = 'dummy input';
    const expectedOutput = {1: 1};

    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});
