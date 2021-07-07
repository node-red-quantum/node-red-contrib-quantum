module.exports = function(RED) {
  'use strict';

  const python = require('../../python-shell');

  function QuantumRegisterNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', async function(msg) {
      await python.executeCommand(`a = ${msg.payload}`, () => {});
      node.send(msg);
    });
  }
  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
