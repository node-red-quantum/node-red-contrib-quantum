'use strict';

const util = require('util');
const snippets = require('../../snippets');
const {PythonShellClass} = require('../../python');
const errors = require('../../errors');

module.exports = function(RED) {
  function GroversNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'Grovers';
    const node = this;
    const shell = new PythonShellClass();

    this.on('input', async function(msg, send, done) {
      let error = errors.validateGroversInput(msg);
      if (error) {
        done(error);
        return;
      }
      const script = util.format(snippets.GROVERS, msg.payload);
      await shell.start();
      await shell.execute(script, (err, data) => {
        if (err) done(err);
        else {
          msg.payload = data;
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }
  RED.nodes.registerType('grovers', GroversNode);
};
