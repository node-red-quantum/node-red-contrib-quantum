'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function GroversAlgoNode(config) { // Change name
    RED.nodes.createNode(this, config);
    this.name = config.name || 'Grover\'s algorithm';
    const node = this;

    this.on('input', async function(msg, send, done) {
      let error = errors.validateGroversInput(msg);
      if (error) {
        done(error);
        return;
      }
      const script = util.format(snippets.GROVERS_ALGO, msg.payload);
      await shell.restart();
      await shell.execute(script, (err, data) => {
        if (err) done(err);
        else {
          msg.payload = data;
          send(msg);
          done();
        }
      });
    });
  }
  RED.nodes.registerType('grovers-algo', GroversAlgoNode); // Change name
};
