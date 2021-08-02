'use strict';
const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function CNotGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.targetPosition = config.targetPosition;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length == 2) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          return;
        }

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
        let controlQubit = node.qubits[0];
        let targetQubit = node.qubits[0];

        // Determine which node is the target based on position.
        if (node.targetPosition == 'Upper') {
          targetQubit = node.qubits[0];
          controlQubit = node.qubits[1];
        } else {
          targetQubit = node.qubits[1];
          controlQubit = node.qubits[0];
        }

        // Generate the corresponding CNot Gate Qiskit script
        // Use qubits only if there are no registers.
        if (typeof msg.payload.register === 'undefined') {
          script += util.format(snippets.CNOT_GATE,
              controlQubit.payload.qubit.toString(),
              targetQubit.payload.qubit.toString(),
          );

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: 'Target: qubit ' + targetQubit.payload.qubit.toString(),
          });
        } else {
          // Use registers if there are quantum registers.
          script += util.format(
              snippets.CNOT_GATE,
              controlQubit.payload.registerVar + '[' +
              controlQubit.payload.qubit.toString() + ']',
              targetQubit.payload.registerVar + '[' +
              targetQubit.payload.qubit.toString() + ']',
          );

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: (
              'Target: register ' + targetQubit.payload.register +
              ' / qubit ' + targetQubit.payload.qubit.toString()
            ),
          });
        }

        // Run the script in the python shell, and if no error occurs
        // then send one qubit object per node output
        await shell.execute(script, (err) => {
          if (err) done(err);
          else {
            send(node.qubits);
            done();
          }
        });

        // Emptying the runtime variable upon output
        node.qubits = [];
      }
    });
  }

  RED.nodes.registerType('cnot-gate', CNotGateNode);
};
