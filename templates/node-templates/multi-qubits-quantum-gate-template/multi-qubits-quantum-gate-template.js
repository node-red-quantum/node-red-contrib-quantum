'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function MultiQubitGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    const node = this;

    // Define a 'reset' function to empty the runtime variables upon sending node output
    const reset = function() {
      node.qubits = [];
      // Initialise other runtime variables here
    };

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for valid qubit object.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        reset();
        return;
      }

      // Store the qubit objects received as input into the `node.qubits` array
      node.qubits.push(msg);

      // If all necessary qubits have arrived
      if (node.qubits.length == node.outputs) {
        // Checking that the qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          reset();
          return;
        }

        // Reorder the `node.qubits` array for output consistency and user-friendliness
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

        // Assign each qubit in `node.qubits` to a variable
        let controlQubit = node.qubits[0];
        let targetQubit = node.qubits[1];

        // If the quantum circuit does not make use of regsiters
        if (typeof msg.payload.register === 'undefined') {
          // Define the node's Qiskit script in `snippets.js`
          script += util.format(snippets.TEMPLATE,
              controlQubit.payload.qubit.toString(),
              targetQubit.payload.qubit.toString(),
          );

          // Use the node's status to share infromation on
          // the quantum operation performed
          node.status({
            fill: 'grey',
            shape: 'dot',
            text: '',
          });

        // If the quantum circuit makes use of registers
        } else {
          // Define the node's Qiskit script in `snippets.js`
          script += util.format(
              snippets.TEMPLATE,
              controlQubit.payload.registerVar + '[' +
              controlQubit.payload.qubit.toString() + ']',
              targetQubit.payload.registerVar + '[' +
              targetQubit.payload.qubit.toString() + ']',
          );

          // Use the node's status to share infromation on
          // the quantum operation performed
          node.status({
            fill: 'grey',
            shape: 'dot',
            text: '',
          });
        }

        // Run the Qiskit script in the python shell
        // If no error occur, send the qubit object as node output
        await shell.execute(script, (err) => {
          if (err) done(err);
          else {
            send(node.qubits);
            done();
          }
          reset();
        });
      }
    });
  }
  RED.nodes.registerType('multi-qubits-quantum-gate-template', MultiQubitGateNode); // Change name
};
