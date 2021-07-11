'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function QuantumCircuitNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.structure = config.structure;
    this.cbits = parseInt(config.cbits);
    this.outputs = parseInt(config.outputs);
    const globalContext = this.context().global;
    const output = new Array(this.outputs);
    const node = this;

    this.on('input', async function(msg, send, done) {
      await shell.restart();
      await shell.execute(snippets.IMPORTS, (err) => {
        if (err) node.error(err);
      });

      // If the user wants to use registers
      if (node.structure == 'registers') {
        // Creating an empty 'quantumCircuit' global array
        // This variable represents the quantum circuit structure
        const quantumCircuit = {
          registers: true,
          structure: new Array(node.outputs),
        };
        globalContext.set('quantumCircuit', quantumCircuit);

        // Creating an array of messages to be sent
        // Each message represents a dfifferent register
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: i,
            },
          };
        };
      } else { // If the user does not want to use registers
        // Creating an empty 'quantumCircuit' global array
        // This variable represents the quantum circuit structure
        const quantumCircuit = {
          registers: false,
          structure: {
            qbits: node.outputs,
            cbits: node.cbits,
          },
        };
        globalContext.set('quantumCircuit', quantumCircuit);

        // Add arguments to quantum circuit code
        let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, node.outputs + ',' + node.cbits);
        await shell.execute(circuitScript, (err) => {
          if (err) node.error(err);
        });

        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: 'no registers',
              qubit: i,
            },
          };
        };
      }

      // Sending one register object per node output
      send(output);
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
