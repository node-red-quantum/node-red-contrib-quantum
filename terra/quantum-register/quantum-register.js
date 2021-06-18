module.exports = function(RED) {
  'use strict';

  function QuantumRegisterNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
