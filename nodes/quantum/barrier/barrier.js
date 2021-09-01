'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function BarrierNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    this.qubits = [];
    const node = this;

    // Reset runtime variables upon output or error
    const reset = function() {
      node.qubits = [];
    };

    logger.trace(this.id, 'Initialised barrier');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Barrier received input');
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        reset();
        return;
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length == node.outputs) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          logger.error(node.id, error);
          done(error);
          reset();
          return;
        }

        node.qubits.sort(function compare(a, b) {
          if (typeof(a.payload.register) !== 'undefined') {
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

        // Generate the corresponding barrier Qiskit script
        script += util.format(snippets.BARRIER, '%s, '.repeat(node.outputs));
        node.qubits.map((msg) => {
          if (typeof(msg.payload.register) === 'undefined') {
            script = util.format(script, msg.payload.qubit.toString());
          } else {
            script = util.format(script, msg.payload.registerVar + '[' + msg.payload.qubit.toString() + ']');
          }
        });

        // Run the script in the python shell, and if no error occurs
        // then send one qubit object per node output
        await shell.execute(script)
            .then(() => {
              send(node.qubits);
              done();
            })
            .catch((err) => {
              logger.error(node.id, err);
              done(err);
            })
            .finally(() => {
              logger.trace(node.id, 'Executed barrier command');
              reset();
            });
      }
    });
  }

  RED.nodes.registerType('barrier', BarrierNode);
};
