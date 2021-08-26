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
    const node = this;

    this.on('input', async function(msg, send, done) {
      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Factorising input...',
      });

      let error = errors.validateShorsInput(msg);
      if (error) {
        node.status({
          fill: 'red',
          shape: 'dot',
          text: 'Factorisation failed!',
        });
        done(error);
        return;
      }

      const params = Number(msg.payload);
      const script = util.format(snippets.SHORS, params);
      await shell.start();
      await shell.execute(script, (err, data) => {
        if (err) {
          node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Factorisation failed!',
          });
          done(err);
        } else {
          node.status({
            fill: 'green',
            shape: 'dot',
            text: 'Factorisation completed!',
          });
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
