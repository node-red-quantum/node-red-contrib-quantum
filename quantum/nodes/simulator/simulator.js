'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const {errors} = require('../../errors');

module.exports = function(RED) {
  const validateInput = (node, msg) => {
    if (msg.topic !== 'Quantum Circuit') {
      node.error(errors.NOT_QUANTUM_CIRCUIT, msg);
    }
  };
  function SimulatorNode(config) {
    RED.nodes.createNode(this, config);
    this.shots = config.shots || 1;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    this.on('input', async function(msg, send, done) {
      validateInput(node, msg);
      let qubitsArrived = true;

      if (typeof(msg.payload.register) === 'undefined') {
        node.qreg = undefined;
        node.qubits.push(msg);

        if (node.qubits.length > msg.payload.structure.qubits) {
          throw new Error(
              'Only qubits from a single quantum circuit should be connected to the simulator node.',
          );
        } else if (node.qubits.length < msg.payload.structure.qubits) qubitsArrived = false;
      } else {
        if (node.qubits.length == 0) {
          node.qreg = {};
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        } else if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }
        node.qubits.push(msg);

        if (Object.keys(node.qreg).length > msg.payload.structure.qreg) {
          throw new Error(
              // eslint-disable-next-line max-len
              'Only qubits of quantum registers from the same quantum circuit should be connected to the simulator node.',
          );
        } else {
          Object.keys(node.qreg).map((registerVar) => {
            if (registerVar.count > registerVar.total) {
              throw new Error(
                  'Only qubits from a single quantum circuit should be connected to the simulator node.',
              );
            } else if (registerVar.count < registerVar.total) {
              qubitsArrived = false;
            }
          });
        }
      }

      if (qubitsArrived) {
        const params = node.shots;
        const simulatorScript = util.format(snippets.SIMULATOR, params);
        await shell.execute(simulatorScript, (err, data) => {
          if (err) {
            node.error(err, msg);
          } else {
            msg.payload = data;
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
