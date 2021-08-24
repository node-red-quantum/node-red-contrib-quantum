'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function QuantumOutputNode(config) { // Change the name
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    // Define a 'reset' function to empty the runtime variables upon sending node output
    const reset = function() {
      node.qubits = [];
      node.qreg = '';
      // Initialise other runtime variables here
    };

    this.on('input', async function(msg, send, done) {
      let script = '';
      let qubitsArrived = true;

      // Validate the node input msg: check for valid qubit object.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        reset();
        return;
      }

      // If the quantum circuit does not have registers
      if (typeof msg.payload.register === 'undefined') {
        // Store the qubit objects received as input into the `node.qubits` array
        node.qubits.push(msg);
        node.qreg = undefined;

        // If not all qubits have arrived
        if (node.qubits.length < msg.payload.structure.qubits) {
          qubitsArrived = false;
        }

      // If the quantum circuit has registers
      } else {
        if (node.qubits.length == 0) node.qreg = {};

        // Throw an error if too many qubits are received by the simulator node
        // because the user connected qubits from different quantum circuits
        if ((
          !Object.keys(node.qreg).includes(msg.payload.registerVar) &&
          Object.keys(node.qreg).length == msg.payload.structure.qreg
        ) || (
          Object.keys(node.qreg).includes(msg.payload.registerVar) &&
          node.qreg[msg.payload.registerVar].count == node.qreg[msg.payload.registerVar].total
        )) {
          done(new Error(errors.QUBITS_FROM_DIFFERENT_CIRCUITS));
          reset();
          return;
        }

        // Storing information about which qubits were received
        if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }

        // Store the qubit objects received as input into the `node.qubits` array
        node.qubits.push(msg);

        // Checking whether all qubits have arrived or not
        if (Object.keys(node.qreg).length == msg.payload.structure.qreg) {
          Object.keys(node.qreg).map((key) => {
            if (node.qreg[key].count < node.qreg[key].total) {
              qubitsArrived = false;
            }
          });
        } else {
          qubitsArrived = false;
        }
      }

      // If all qubits have arrived
      if (qubitsArrived) {
        // Checking that the qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          reset();
          return;
        }

        // Define the node's Qiskit script in `snippets.js`
        script += util.format(snippets.TEMPLATE);

        // Run the Qiskit script in the python shell
        // If no error occur, send the qubit object as node output
        await shell.execute(script, (err, data) => {
          if (err) {
            done(err);
          } else {
            // Store the node's output in `msg.payload` and send it
            msg.payload = '';
            send(msg);
            done();
          }
          reset();
        });
      }
    });
  }

  RED.nodes.registerType('quantum-output-node-template', QuantumOutputNode); // Change the name
};
