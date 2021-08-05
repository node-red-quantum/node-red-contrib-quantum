'use strict';

const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function CircuitDiagramNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = [];
    this.qreg = '';
    const node = this;

    this.on('input', async function(msg, send, done) {
      let qubitsArrived = true;

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
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
      // generate the circuit print script and run it
      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          reset();
          return;
        }

        // Emptying the runtime variables upon output
        node.qubits = [];
        node.qreg = '';

        let script = snippets.CIRCUIT_BUFFER;
        await shell.execute(script, (err, data) => {
          if (err) {
            done(err);
          } else {
            msg.payload = data.split('\'')[1];
            msg.encoding = 'base64';
            send(msg);
            done();
          }
          reset();
        });
      }
    });
  };
  RED.nodes.registerType('circuit-diagram', CircuitDiagramNode);
};
