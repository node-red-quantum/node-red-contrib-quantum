'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function MultiControlledUGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    this.nbControls = parseInt(config.nbControls);
    this.targetPosition = parseInt(config.targetPosition);
    this.theta = config.theta;
    this.phi = config.phi;
    this.lambda = config.lambda;
    this.qubits = [];
    const node = this;

    // Reset runtime variables upon output or error
    const reset = function() {
      node.qubits = [];
    };

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
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
        let targetQubit = {};
        let controlQubits = [];
        node.qubits.map((qubit, index) => {
          if (index == node.targetPosition) targetQubit = qubit;
          else controlQubits.push(qubit);
        });

        let params = '[ ';
        // Generate the corresponding MCU Gate Qiskit script
        // Use qubits only if there are no registers.
        if (typeof msg.payload.register === 'undefined') {
          controlQubits.map((qubit) => {
            params += qubit.payload.qubit.toString() + ', ';
          });
          params += targetQubit.payload.qubit.toString() + ' ]';

          script += util.format(snippets.MULTI_CONTROLLED_U_GATE,
              node.theta + '*pi',
              node.phi + '*pi',
              node.lambda + '*pi',
              node.nbControls.toString(),
              params,
          );

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: 'Target: qubit ' + targetQubit.payload.qubit.toString(),
          });

          // Use registers if there are quantum registers.
        } else {
          controlQubits.map((qubit) => {
            params += (
              qubit.payload.registerVar + '[' +
              qubit.payload.qubit.toString() + '], '
            );
          });
          params += (
            targetQubit.payload.registerVar + '[' +
            targetQubit.payload.qubit.toString() + '] ]'
          );

          script += util.format(snippets.MULTI_CONTROLLED_U_GATE,
              node.theta + '*pi',
              node.phi + '*pi',
              node.lambda + '*pi',
              node.nbControls.toString(),
              params,
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

  RED.nodes.registerType('multi-controlled-u-gate', MultiControlledUGateNode);
};
