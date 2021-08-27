'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function NotGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    logger.trace(this.id, 'Initialised not gate');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Not gate received input');
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

      if (typeof msg.payload.register === 'undefined') {
        script += util.format(snippets.NOT_GATE, msg.payload.qubit);
      } else {
        script += util.format(snippets.NOT_GATE, msg.payload.registerVar + '[' + msg.payload.qubit + ']');
      }

      // Run the script in the python shell, and if no error occurs
      // then send msg object to the next node
      await shell.execute(script, (err) => {
        logger.trace(node.id, 'Executed not gate command');
        if (err) {
          logger.error(node.id, err);
          done(err);
        } else {
          send(msg);
          done();
        }
      });
    });
  }
  RED.nodes.registerType('not-gate', NotGateNode);
};
