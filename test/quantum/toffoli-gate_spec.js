let helper = require('node-red-node-test-helper');
let toffoliGateNode = require('../quantum/toffoli-gate.js');

describe('toffoli-gate Node', function() {
  before(function(done) {
    helper.startServer(done);
  });

  afterEach(function() {
    helper.unload();
  });

  after(function(done) {
    helper.stopServer(done);
  });

  it('should be loaded', function(done) {
    let flow = [
      {
        id: 'n1',
        type: 'toffoli-gate',
        name: 'test name',
        targetPosition: 'Top',
      },
    ];
    helper.load(toffoliGateNode, flow, function() {
      let n1 = helper.getNode('n1');
      n1.should.have.property('name', 'targetPosition');
      done();
    });
  });

  it('should apply toffoli gate to 3 input qubits', function(done) {
    let flow = [
      {id: 'n3', type: 'quantum-circuit', wires: [['n2']]},
      {id: 'n2', type: 'toffoli-gate', wires: [['n3']]},
      {id: 'n3', type: 'helper'},
    ];
    helper.load(toffoliGateNode, flow, function() {
      let n2 = helper.getNode('n2');
      let n1 = helper.getNode('n1');
      n2.on('input', function(msg) {
        msg.should.have.property('payload', 'uppercase');
        done();
      });
      n1.receive({payload: 'UpperCase'});
    });
  });
});
