'use strict';

const util = require('util');
const isOnline = require('is-online');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function IBMQuantumSystemNode(config) {
    RED.nodes.createNode(this, config);
    this.apiToken = config.api_token;
    this.chosenSystem = config.chosen_system;
    this.preferredBackend = config.preferred_backend;
    this.outputPreference = config.preferred_output;
    this.shots = config.shots || 1;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    // Reset runtime variables upon output or error
    const reset = function() {
      node.qubits = [];
      node.qreg = '';
    };

    this.on('input', async function(msg, send, done) {
      let qubitsArrived = true;

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        reset();
        return;
      }


      // If the quantum circuit does not have registers
      if (typeof(msg.payload.register) === 'undefined') {
        node.qreg = undefined;
        node.qubits.push(msg);

        // If not all qubits have arrived
        if (node.qubits.length < msg.payload.structure.qubits) {
          qubitsArrived = false;
        }
      } else {
        // If the quantum circuit has registers
        // Keep track of qubits that have arrived and the remaining ones
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

      // If all qubits have arrived,
      // generate the quantum system script and run it
      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          reset();
          return;
        }

        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Job running...',
        });

        let script = '';

        if (node.preferredBackend) {
          script += util.format(snippets.IBMQ_SYSTEM_PREFERRED, node.apiToken, node.preferredBackend);
        } else {
          if (node.chosenSystem == 'Qubit_System') {
            script += util.format(snippets.IBMQ_SYSTEM_DEFAULT, node.apiToken, node.qubits.length, 'False');
          } else {
            if (node.qubits.length > 32) {
              script += util.format(snippets.IBMQ_SYSTEM_DEFAULT, node.apiToken, node.qubits.length, 'True');
            } else {
              script += util.format(snippets.IBMQ_SYSTEM_QASM, node.apiToken);
            }
          }
        }

        if (node.outputPreference == 'Verbose') {
          script += util.format(snippets.IBMQ_SYSTEM_VERBOSE, node.shots);
        } else {
          script += util.format(snippets.IBMQ_SYSTEM_RESULT, node.shots);
        }

        if (!await isOnline()) {
          node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Failed to connect',
          });

          done(new Error(errors.NO_INTERNET));
          reset();
          return;
        }

        await shell.execute(script, (err, data) => {
          if (err) {
            node.status({
              fill: 'red',
              shape: 'dot',
              text: 'Job failed!',
            });
            done(err);
          } else {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'Job completed!',
            });
            msg.payload = data;
            send(msg);
            done();
          }
          reset();
        });
      }
    });
  }

  RED.nodes.registerType('ibm-quantum-system', IBMQuantumSystemNode);
};
