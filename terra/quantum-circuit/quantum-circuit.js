module.exports = function(RED) {
  'use strict';

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
