'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function UnitaryGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.theta = config.theta;
    this.phi = config.phi;
    this.lambda = config.lambda;
    const node = this;

    logger.trace(this.id, 'Initialised unitary gate');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Unitary gate received input');
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
        script += util.format(snippets.UNITARY_GATE,
            node.theta + '*pi',
            node.phi + '*pi',
            node.lambda + '*pi',
            msg.payload.qubit,
        );
      } else {
        script += util.format(snippets.UNITARY_GATE,
            node.theta + '*pi',
            node.phi + '*pi',
            node.lambda + '*pi',
            msg.payload.registerVar + '[' + msg.payload.qubit + ']',
        );
      }

      // Run the script in the python shell, and if no error occurs
      // then send msg object to the next node
      await shell.execute(script)
          .then(() => {
            node.status({
              fill: 'grey',
              shape: 'dot',
              text: (
                node.theta.toString() + '\u03C0, ' +
                node.phi.toString() + '\u03C0, ' +
                node.lambda.toString() + '\u03C0'
              ),
            });
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed unitary gate command');
          });
    });
  }
  RED.nodes.registerType('unitary-gate', UnitaryGateNode);
};
