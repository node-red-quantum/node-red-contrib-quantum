'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

const validateInput = (node, msg) => {
  if (msg.topic !== 'Quantum Circuit') {
    node.error(errors.NOT_QUANTUM_CIRCUIT, msg);
  }
};

module.exports = function(RED) {
  function SimulatorNode(config) {
    RED.nodes.createNode(this, config);
    this.shots = config.shots || 1;
    this.qubits = [];
    this.qreg = '';
    const node = this;
    this.on('input', async function(msg, send, done) {
      let script = '';
      validateInput(node, msg);
      let qubitsArrived = true;

      // If the quantum circuit does not have registers
      if (typeof(msg.payload.register) === 'undefined') {
        node.qreg = undefined;
        node.qubits.push(msg);

        // If the simulator node has more inputs than qubits in the circuit
        if (node.qubits.length > msg.payload.structure.qubits) {
          throw new Error(
              'Only qubits from a single quantum circuit should be connected to the simulator node.',
          );
        // If not all qubits have arrived
        } else if (node.qubits.length < msg.payload.structure.qubits) qubitsArrived = false;
      } else {// If the quantum circuit has registers
        // Keep track of qubits that have arrived and the remaining ones
        if (node.qubits.length == 0) node.qreg = {};
        if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }
        node.qubits.push(msg);

        // If the simulator node has inputs from more q-registers than there are in the circuit
        if (Object.keys(node.qreg).length > msg.payload.structure.qreg) {
          throw new Error(
              // eslint-disable-next-line max-len
              'Only qubits of quantum registers from the same quantum circuit should be connected to the simulator node.',
          );
        } else if (Object.keys(node.qreg).length == msg.payload.structure.qreg) {
          Object.keys(node.qreg).map((key) => {
            // If the simulator node has inputs from more qubits than there are in a register
            if (node.qreg[key].count > node.qreg[key].total) {
              throw new Error(
                  'Only qubits from a single quantum circuit should be connected to the simulator node.',
              );
              // If not all qubits have arrived
            } else if (node.qreg[key].count < node.qreg[key].total) {
              qubitsArrived = false;
            }
          });
        } else {
          qubitsArrived = false;
        }
      }

      // If all qubits have arrives, generate the simulator script and run it
      if (qubitsArrived) {
        // Emptying the runtime variables upon output
        node.qubits = [];
        node.qreg = '';
        const params = node.shots;
        script += util.format(snippets.SIMULATOR, params);
        await shell.execute(script, (err, data) => {
          node.error(shell.script);
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
