'use strict';
const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  const targetPosition = document.getElementById('target-position').value;

  function CNotGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    const node = this;

    node.on('input', async function(msg, send, done, targetQubit, controlQubit) {
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - The user chooses to use registers but does not initiate them
      // - The user does not input 2 qubits.
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'The CNot Gate must be connected to nodes from the quantum library only.',
        );
      } else if (typeof(msg.payload.register) === 'undefined' && typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'The CNot Gate nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      } else if (node.qubits.length !== 2) {
        throw new Error(
            'The CNot Gate requires exactly 2 input qubits to be used.',
        );
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length === 2) {
        node.qubits.sort(function compare(a, b) {
          if (typeof (a.payload.register) !== 'undefined') {
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

        if (targetPosition === 'upper') {
          targetQubit = node.qubits[0];
          controlQubit = node.qubits[1];
        } else {
          targetQubit = node.qubits[1];
          controlQubit = node.qubits[0];
        }

        // Generate the corresponding cnot-gate Qiskit script
        let cnotScript = util.format(snippets.CNOT_GATE, '%s,'.repeat(node.outputs));
        node.qubits.map((msg) => {
          if (typeof (msg.payload.register) === 'undefined') {
            cnotScript = util.format(cnotScript,
                controlQubit.toString(), targetQubit.toString());
          } else {
            cnotScript = util.format(cnotScript,
                controlQubit.registerVar + '[' + controlQubit.toString() + ']',
                targetQubit.registerVar + '[' + targetQubit.toString() + ']');
          }
        });

        // Run the script in the python shell
        await shell.execute(cnotScript, (err) => {
          if (err) node.error(err);
        });

        // Sending one qubit object per node output
        send(node.qubits);
      }
    });
  }

  RED.nodes.registerType('cnot-gate', CNotGateNode);
};
