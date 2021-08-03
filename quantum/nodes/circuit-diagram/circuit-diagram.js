'use strict';

const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function CircuitDiagramNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;

    this.on('input', async function(msg, send, done) {
      let script = snippets.CIRCUIT_BUFFER;

      await shell.execute(script, (err, data) => {
        if (err) {
          done(err);
        } else {
          msg.payload = data.split('\'')[1];
          msg.encoding = 'base64';
          send(msg);
          done();
        }
      });
    });
  };
  RED.nodes.registerType('circuit-diagram', CircuitDiagramNode);
};
