'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const {PythonShellClass} = require('../../python');
const shell = new PythonShellClass();

module.exports = function(RED) {
  function GroversNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'Grovers';

    this.on('input', async function(msg, send, done) {
      let error = errors.validateGroversInput(msg);
      if (error) {
        this.error(error.message);
        done();
      }

      const script = util.format(snippets.GROVERS, msg.payload);
      await shell.start();
      await shell.execute(script, (err, data) => {
        if (err) {
          done(err);
        } else {
          data = data.split('\n');
          msg.payload = {
            topMeasurement: data[0],
            iterationsNum: Number(data[1]),
          };
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }
  RED.nodes.registerType('grovers', GroversNode);
};
