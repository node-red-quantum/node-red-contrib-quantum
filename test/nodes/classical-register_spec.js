const util = require('util');
const testUtil = require('../test-util');
const classicalRegisterNode = require('../../nodes/quantum/classical-register/classical-register.js');
const {FlowBuilder} = require('../flow-builder');
const nodeTestHelper = testUtil.nodeTestHelper;
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('ClassicalRegisterNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(classicalRegisterNode, 'classical-register', done);
  });

  it('execute quantum circuit initilization command if it is the last register node connected', function(done) {
    let command = util.format(snippets.CLASSICAL_REGISTER, '_test', '3, "test"');
    command += util.format(snippets.QUANTUM_CIRCUIT, 'qr0,cr_test,');
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2']],
        {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('quantum-register', 'n1', [['n3']], {outputs: '1'});
    flow.add('classical-register', 'n2', [], {classicalBits: '3', name: 'test'});
    flow.addOutput('n3');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('classical-register', 'n1', [[]], {classicalBits: '3', name: 'test'});

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-register object', function(done) {
    flow.add('classical-register', 'n1', [[]], {classicalBits: '3', name: 'test'});

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_REGISTER_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });
});
