module.exports = function(RED) {
  'use strict';

  const path = require('path');
  const appRoot = require('app-root-path').path;
  const pythonShell = require('python-shell').PythonShell;
  const fs = require('fs');
  const pythonPath = path.resolve(appRoot, 'venv/bin/python');

  if (!fs.existsSync(pythonPath)) {
    console.log('WARNING: venv/bin/python does not exist - execute the "npm run setup" command');
  }

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;

    this.on('input', function(msg) {
      const options = {
        pythonPath: pythonPath,
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
