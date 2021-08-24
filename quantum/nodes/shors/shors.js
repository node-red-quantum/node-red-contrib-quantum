'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const {PythonShellClass} = require('../../python');
const shell = new PythonShellClass();

module.exports = function(RED) {
  function ShorsNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;

    this.on('input', async function(msg, send, done) {
      let error = errors.validateShorsInput(msg);
      if (error) {
         this.error(error.message);
         return;
      }
      const params = Number(msg.payload);
      const script = util.format(snippets.SHORS, params);
      await shell.start();
      await shell.execute(script, (err, data) => {
        if (err) {
          done(err);
        } else {
          msg.payload = {
            listOfFactors: data,
          };
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }
  RED.nodes.registerType('shors', ShorsNode);
};
