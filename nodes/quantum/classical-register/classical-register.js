'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const stateManager = require('../../state').StateManager;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.classicalBits = config.classicalBits;
    const node = this;

    logger.trace(this.id, 'Initialised classical register');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Classical register received input');
      const state = stateManager.getState(msg.circuitId);

      // Validate the node input msg: check for register object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateRegisterInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      // Add arguments to classical register code
      let crscript = util.format(snippets.CLASSICAL_REGISTER,
          '_' + node.name,
          node.classicalBits.toString() + ', "' + node.name + '"',
      );

      await shell.execute(crscript, (err) => {
        if (err) {
          error = err;
        } else {
          error = null;
        }
      });

      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'classical',
        registerName: node.name,
        registerVar: 'cr_' + node.name,
      };
      let quantumCircuit = state.get('quantumCircuit');
      quantumCircuit[msg.payload.register.toString()] = register;

      // get quantum circuit config and circuit ready event from flow context
      let quantumCircuitConfig = state.get('quantumCircuitConfig');

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(state.get('quantumCircuit')) !== undefined) {
        let structure = state.get('quantumCircuit');

        // Validating the registers' structure according to the user input in 'Quantum Circuit'
        // And counting how many registers were initialised so far.
        let [error, count] = errors.validateRegisterStrucutre(structure, msg.payload.structure);
        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }

        // If all register initialised & the circuit has not been initialised by another register:
        // Initialise the quantum circuit
        if (count == structure.length && typeof(state.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' variable, not used anymore
          state.del('quantumCircuit');

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          // Run the script in the python shell, and if no error occurs
          // then notify the runtime when the node is done.
          await shell.execute(circuitScript, (err) => {
            logger.trace(node.id, 'Executed classical register command');
            if (err) {
              logger.error(node.id, err);
              done(err);
            } else {
              done();
            };
          });
        }
      }

      // update quantum circuit config
      quantumCircuitConfig[node.name] = register;
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
