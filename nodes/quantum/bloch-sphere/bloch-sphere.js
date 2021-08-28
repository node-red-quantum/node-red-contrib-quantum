'use strict';

const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function BlochSphereNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    const reset = function() {
      node.qubits = [];
      node.qreg = '';
    };

    logger.trace(this.id, 'Initialised bloch sphere');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Bloch sphere received input');
      let script = '';
      let qubitsArrived = true;

      let error = errors.validateQubitInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        reset();
        return;
      }
      // Throw Error if:
      // - The user connects it to a node that is not from the quantum library
      if (typeof(msg.payload.register) === 'undefined') {
        node.qubits.push(msg);
        node.qreg = undefined;

        // Check if all qubits arrived.
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
          let error = new Error(errors.QUBITS_FROM_DIFFERENT_CIRCUITS);
          logger.error(node.id, error);
          done(error);
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

      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          logger.error(node.id, error);
          done(error);
          reset();
          return;
        }

        script += snippets.BLOCH_SPHERE + snippets.ENCODE_IMAGE;
        await shell.execute(script)
            .then((data) => {
              msg.payload = data.split('\'')[1];
              msg.encoding = 'base64';
              send(msg);
              done();
            }).catch((err) => {
              // Check if error is due to script containing a measurement
              if (shell.script.includes(snippets.MEASURE.toString().substring(0, 11))) {
                err = new Error(errors.BLOCH_SPHERE_WITH_MEASUREMENT);
              }
              logger.error(node.id, err);
              done(err);
            }).finally(() => {
              logger.trace(node.id, 'Executed bloch sphere command');
              reset();
            });
      }
    });
  };
  RED.nodes.registerType('bloch-sphere', BlochSphereNode);
};
