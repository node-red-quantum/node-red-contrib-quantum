'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function SingleQbitGateNode(config) { // Change name
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    // If the node uses runtime 'default' variables, define a 'reset'
    // function to empty the runtime variables upon sending node output
    const reset = function() {
      // Initialise runtime variables here
      // node.qubits = [];
    };

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for valid qubit object.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        reset();
        return;
      }

      // If the quantum circuit does not make use of regsiters
      if (typeof msg.payload.register === 'undefined') {
        // Define the node's Qiskit script in `snippets.js`
        script += util.format(snippets.TEMPLATE, msg.payload.qubit);

      // If the quantum circuit makes use of registers
      } else {
        // Define the node's Qiskit script in `snippets.js`
        script += util.format(snippets.TEMPLATE, msg.payload.registerVar + '[' + msg.payload.qubit + ']');
      }

      // Run the Qiskit script in the python shell
      // If no error occur, send the qubit object as node output
      await shell.execute(script, (err) => {
        if (err) done(err);
        else {
          send(msg);
          done();
        }
        reset();
      });
    });
  }
  RED.nodes.registerType('single-qubit-quantum-gate-template', SingleQbitGateNode); // Change name
};
