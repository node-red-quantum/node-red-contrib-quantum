module.exports = function(RED) {
  'use strict';

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;

    this.on('input', function(msg) {
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
