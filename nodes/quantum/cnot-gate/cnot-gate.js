'use strict';
const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function CNotGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.targetPosition = config.targetPosition;
    const node = this;

    // Reset runtime variables upon output or error
    const reset = function() {
      node.qubits = [];
    };

    logger.trace(this.id, 'Initialised CNOT gate');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'CNOT gate received input');
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
      if (node.qubits.length == 2) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          logger.error(node.id, error);
          done(error);
          reset();
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
          logger.trace(node.id, 'Executed CNOT gate command');
          if (err) {
            logger.error(node.id, err);
            done(err);
          } else {
            send(node.qubits);
            done();
          }
          reset();
        });
      }
    });
  }

  RED.nodes.registerType('cnot-gate', CNotGateNode);
};
