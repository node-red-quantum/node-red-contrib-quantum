'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function ResetNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

      if (typeof msg.payload.register === 'undefined') {
        script += util.format(snippets.RESET, msg.payload.qubit);
      } else {
        script += util.format(snippets.RESET, `msg.payload.registerVar + '[' + msg.payload.qubit + ']'`);
      }

      // Run the script in the python shell, and if no error occurs
      // then send msg object to the next node
      await shell.execute(script, (err) => {
        if (err) done(err);
        else {
          send(msg);
          done();
        }
      });
    });
  }
  RED.nodes.registerType('reset', ResetNode);
};
