'use strict';

const util = require('util');
const dedent = require('dedent-js');
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
    const flowContext = this.context().flow;
    const node = this;
    const output = new Array(node.outputs);

    this.on('input', function(msg, send, done) {
      // Storing import script to the 'script' global variable
      let qiskitScript = dedent(`
        import numpy as np
        import qiskit
        from qiskit import *
        \n
      `);
      flowContext.set('script', qiskitScript);

      // If the user wants to use registers
      if (node.structure == 'registers') {
        // Creating a temporary 'quantumCircuit' flow context array
        // This variable represents the quantum circuit structure
        const quantumCircuit = {
          registers: true,
          structure: new Array(node.outputs),
        };
        flowContext.set('quantumCircuit', quantumCircuit);

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
        // Appending Qiskit script to the 'script' global variable to initiate the quantum circuit
        qiskitScript = dedent(`
          qc = QuantumCircuit(%s, %s)
          \n
        `);
        qiskitScript = util.format(qiskitScript,
            node.outputs,
            node.cbits,
        );

        const oldScript = flowContext.get('script');
        flowContext.set('script', oldScript + qiskitScript);

        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: undefined,
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
