'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function BarrierNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    this.qubits = [];
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - The user chooses to use registers but does not initiate them
      // - The user inputs more qubits than selected in the node properties
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'Quantum barrier nodes must be connected to nodes from the quantum library only.',
        );
      } else if (typeof(msg.payload.register) === 'undefined' && typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'Quantum barrier nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      } else if (node.qubits.length >= node.outputs) {
        throw new Error(
            'Please inputs the same number of qubits than selected in the node properties.',
        );
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length == node.outputs) {
        node.qubits.sort(function compare(a, b) {
          if (typeof(a.payload.register) !== 'undefined') {
            const regA = parseInt(a.payload.registerVar.slice(2));
            const regB = parseInt(b.payload.registerVar.slice(2));
            if (regA < regB) return -1;
            else if (regA > regB) return 1;
            else {
              if (a.payload.qubit < b.payload.qubit) return -1;
              else return 1;
            }
          } else {
            if (a.payload.qubit < b.payload.qubit) return -1;
            else return 1;
          }
        });

        // Generate the corresponding barrier Qiskit script
        script += util.format(snippets.BARRIER, '%s, '.repeat(node.outputs));
        node.qubits.map((msg) => {
          if (typeof(msg.payload.register) === 'undefined') {
            script = util.format(script, msg.payload.qubit.toString());
          } else {
            script = util.format(script, msg.payload.registerVar + '[' + msg.payload.qubit.toString() + ']');
          }
        });

        // Run the script in the python shell, and if no error occurs
        // then send one qubit object per node output
        await shell.execute(script, (err) => {
          if (err) node.error(err);
          else {
            send(node.qubits);

            // Emptying the runtime variable upon output
            node.qubits = [];
          }
        });
      }
    });
  }

  RED.nodes.registerType('barrier', BarrierNode);
};
