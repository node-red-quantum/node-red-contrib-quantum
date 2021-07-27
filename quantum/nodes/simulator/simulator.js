'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function SimulatorNode(config) {
    RED.nodes.createNode(this, config);
    this.shots = config.shots || 1;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
      let qubitsArrived = true;

      // Validate the node input msg: check for qubit object.
      // Throw corresponding errors if required.
      errors.validateQubitInput(node, msg);

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
          node.error(errors.QUBITS_FROM_DIFFERENT_CIRCUITS);
        }

        // Storing information about which qubits were received
        if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else if (!Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }

        node.qubits.push(msg);

        // Checking whether all qubits have arrived or not
        Object.keys(node.qreg).map((key) => {
          if (node.qreg[key].count < node.qreg[key].total) {
            qubitsArrived = false;
          }
        });
      }

      // If all qubits have arrived,
      // generate the simulator script and run it
      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        errors.validateQubitsFromSameCircuit(node, node.qubits);

        // Emptying the runtime variables upon output
        node.qubits = [];
        node.qreg = '';

        const params = node.shots;
        script += util.format(snippets.SIMULATOR, params);
        await shell.execute(script, (err, data) => {
          // Temporary
          node.error(shell.script);
          //
          if (err) {
            node.error(err);
          } else {
            msg.payload = JSON.parse(data.replace(/'/g, '"'));
            send(msg);
          }
        });
        if (done) {
          done();
        }
      }
    });
  }

  RED.nodes.registerType('simulator', SimulatorNode);
};
