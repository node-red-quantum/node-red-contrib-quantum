module.exports = function(RED) {
  'use strict';

  const python = require('../../python-shell');

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;

    this.on('input', async function(msg) {
      await python.executeCommand('print(a * a)', (data, err) => {
        if (err) {
          node.error(err);
        } else {
          msg.payload = data;
          node.send(msg);
        }
      });
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
