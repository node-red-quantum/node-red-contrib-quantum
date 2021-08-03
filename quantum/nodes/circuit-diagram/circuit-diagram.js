'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function CircuitDiagramNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = snippets.IMPORTS;

      let circuitScript;
      circuitScript = script + util.format(snippets.CIRCUIT_DRAW);
      await shell.execute(circuitScript, (err) => {
        if (err) {
          node.error(err);
        }
      });

      let bufferScript;
      bufferScript = util.format(snippets.BUFFER_DRAW);
      await shell.execute(bufferScript, (err, data) => {
        if (err) {
          node.error(err);
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