module.exports = function(RED) {
  'use strict';

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;
    const pythonShell = require('python-shell').PythonShell;

    this.on('input', function(msg) {
      const options = {
        scriptPath: __dirname,
        args: [node.qubits, node.cbits],
      };

      pythonShell.run('quantum-circuit.py', options, function(err, result) {
        if (err) throw err;
        msg.payload = result;
        node.send(msg);
      });
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
