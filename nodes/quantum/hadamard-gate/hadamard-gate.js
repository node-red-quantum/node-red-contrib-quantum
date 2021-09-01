'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function HadamardGateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    logger.trace(this.id, 'Initialised hadamard gate');

    node.on('input', async (msg, send, done) => {
      logger.trace(node.id, 'Hadamard gate received input');
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let qrConfig = msg.payload;
      script += util.format(snippets.HADAMARD_GATE,
        qrConfig.register ? `${qrConfig.registerVar}[${qrConfig.qubit}]` : `${qrConfig.qubit}`);

      // execute the script and pass the quantum register config to the output if no errors occurred
      await shell.execute(script)
          .then(() => {
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed hadamard gate command');
          });
    });
  }

  RED.nodes.registerType('hadamard-gate', HadamardGateNode);
};
