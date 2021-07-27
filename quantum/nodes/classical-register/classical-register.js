'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.classicalBits = config.classicalBits;
    const flowContext = this.context().flow;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for register object.
      // Throw corresponding errors if required.
      errors.validateRegisterInput(node, msg);

      // Add arguments to classical register code
      script += util.format(snippets.CLASSICAL_REGISTER,
          '_' + node.name,
          node.classicalBits.toString() + ', "' + node.name + '"',
      );

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'classical',
        registerName: node.name,
        registerVar: 'cr_' + node.name,
      };
      flowContext.set('quantumCircuit[' + msg.payload.register.toString() + ']', register);

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(flowContext.get('quantumCircuit')) !== undefined) {
        // Counting the number of registers that were set in the 'quantumCircuit' array
        let structure = flowContext.get('quantumCircuit');

        let count = 0;
        let qreg = 0;
        let creg = 0;
        structure.map((x) => {
          if (typeof(x) !== 'undefined') {
            count += 1;
            if (x.registerType === 'quantum') qreg += 1;
            else creg += 1;
          }
        });

        // If the user specified a register structure in the 'Quantum Circuit' node that
        // does not match the visual structure built using the register nodes, throw an error
        if (qreg > msg.payload.structure.qreg || creg > msg.payload.structure.creg) {
          node.error(errors.INVALID_REGISTER_NUMBER);

        // If all set & the quantum circuit has not yet been initialised by another register:
        // Initialise the quantum circuit
        } else if (count == structure.length && typeof(flowContext.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' flow context variable, not used anymore
          flowContext.set('quantumCircuit', undefined);

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          script += circuitScript;
        }
      }

      // Run the script in the python shell, and if no error occurs
      // then notify the runtime when the node is done.
      await shell.execute(script, (err) => {
        if (err) node.error(err);
        else done();
      });
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
