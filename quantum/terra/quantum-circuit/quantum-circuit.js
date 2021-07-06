module.exports = function(RED) {
  'use strict';

  const shell = require('../../python-shell');

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;

    this.on('input', function(msg) {
      shell.runScript(__dirname, 'quantum-circuit.py', [node.qubits, node.cbits], function(err, output) {
        if (err) throw err;
        msg.payload = output;
        node.send(msg);
      });
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
