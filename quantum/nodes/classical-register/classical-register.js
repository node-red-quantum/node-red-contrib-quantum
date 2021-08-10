'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const state = require('../../state').GlobalState;
const errors = require('../../errors');

module.exports = function(RED) {
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.classicalBits = config.classicalBits;
    const flowContext = state;
    const node = this;

    this.on('input', async function(msg, send, done) {
      // Validate the node input msg: check for register object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateRegisterInput(msg);
      if (error) {
        done(error);
        return;
      }

      // Add arguments to classical register code
      let crscript = util.format(snippets.CLASSICAL_REGISTER,
          '_' + node.name,
          node.classicalBits.toString() + ', "' + node.name + '"',
      );

      await shell.execute(crscript, (err) => {
        if (err) node.error(err);
      });

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'classical',
        registerName: node.name,
        registerVar: 'cr_' + node.name,
      };
      flowContext.set('quantumCircuit[' + msg.payload.register.toString() + ']', register);

      // get quantum circuit config and circuit ready event from flow context
      let quantumCircuitConfig = flowContext.get('quantumCircuitConfig');

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(flowContext.get('quantumCircuit')) !== undefined) {
        let structure = flowContext.get('quantumCircuit');

        // Validating the registers' structure according to the user input in 'Quantum Circuit'
        // And counting how many registers were initialised so far.
        let [error, count] = errors.validateRegisterStrucutre(structure, msg.payload.structure);
        if (error) {
          done(error);
          return;
        }

        // If all register initialised & the circuit has not been initialised by another register:
        // Initialise the quantum circuit
        if (count == structure.length && typeof(flowContext.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' flow context variable, not used anymore
          flowContext.set('quantumCircuit', undefined);

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          // Run the script in the python shell, and if no error occurs
          // then notify the runtime when the node is done.
          await shell.execute(circuitScript, (err) => {
            if (err) done(err);
            else done();
          });
        }
      }

      // update quantum circuit config
      quantumCircuitConfig[node.name] = register;
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
