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
      let script = '';

      // Validate the node input msg: check for register object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      logger.trace(node.id, 'Classical register validating');
      let error = errors.validateRegisterInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let shouldInitCircuit = msg.shouldInitCircuit;
      let registerArr = state.get('registers');
      let circuitReadyEvent = state.get('quantumCircuitReadyEvent');

      // Add arguments to classical register code
      script += util.format(snippets.CLASSICAL_REGISTER,
          '_' + node.name,
          node.classicalBits.toString() + ', "' + node.name + '"',
      );

      registerArr.push(`cr_${node.name}`);

      if (shouldInitCircuit) {
        logger.trace(node.id, 'Should execute quantum circuit init command');
        script += util.format(snippets.QUANTUM_CIRCUIT, registerArr.join(','));
      }

      // Run the script in the python shell, and if no error occurs
      // then notify the runtime when the node is done.
      await shell.execute(script)
          .then(() => {
            if (shouldInitCircuit) {
              logger.trace(node.id, 'Classical register emitted circuit ready event');
              circuitReadyEvent.emit('circuitReady', null);
              state.del('registers');
            }
            done();
          })
          .catch((err) => {
            logger.error(node.id, err);
            done(err);
          })
          .finally(() => {
            logger.trace(node.id, 'Executed classical register command');
          });
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
