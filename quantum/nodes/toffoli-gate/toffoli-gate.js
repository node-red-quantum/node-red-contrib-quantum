'use strict';
const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function ToffoliGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.targetPosition = config.targetPosition;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library.
      // - The user does not input a qubit object in the node.
      // - The user chooses to use registers but does not initiate them.
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'The Toffoli Gate must be connected to nodes from the quantum library only.',
        );
      } else if (
        typeof msg.payload.register === 'undefined' &&
        typeof msg.payload.qubit === 'undefined'
      ) {
        throw new Error(
            'The Toffoli Gate nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof msg.payload.qubit === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length == 3) {
        node.qubits.sort(function compare(a, b) {
          if (typeof a.payload.register !== 'undefined') {
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

        // Initialise qubit variables for script.
        let control1 = node.qubits[0];
        let control2 = node.qubits[0];
        let target = node.qubits[0];

        // Determine which node is the target based on position.
        if (node.targetPosition == 'Top') {
          target = node.qubits[0];
          control1 = node.qubits[1];
          control2 = node.qubits[2];
        } else if (node.targetPosition == 'Middle') {
          target = node.qubits[1];
          control1 = node.qubits[0];
          control2 = node.qubits[2];
        } else {
          target = node.qubits[2];
          control1 = node.qubits[0];
          control2 = node.qubits[1];
        }

        // Generate the corresponding Toffoli Gate Qiskit script
        // Use qubits only if there are no registers.
        if (typeof msg.payload.register === 'undefined') {
          script += util.format(
              snippets.TOFFOLI_GATE,
              control1.payload.qubit.toString(),
              control2.payload.qubit.toString(),
              target.payload.qubit.toString(),
          );

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: 'Target: qubit ' + target.payload.qubit.toString(),
          });
        } else {
          // Use registers if there are quantum registers.
          script += util.format(
              snippets.TOFFOLI_GATE,
              control1.payload.registerVar +
              '[' +
              control1.payload.qubit.toString() +
              ']',
              control2.payload.registerVar +
              '[' +
              control2.payload.qubit.toString() +
              ']',
              target.payload.registerVar +
              '[' +
              target.payload.qubit.toString() +
              ']',
          );

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: 'Target: register ' + target.payload.register + ' / qubit ' + target.payload.qubit.toString(),
          });
        }

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

  RED.nodes.registerType('toffoli-gate', ToffoliGateNode);
};
