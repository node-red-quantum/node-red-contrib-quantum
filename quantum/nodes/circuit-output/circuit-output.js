'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function CircuitOutputNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg, send, done) => {
      let shellScript = '';
      // Add error control logic
      shellScript += snippets.IMPORTS;
      // const params = '/Users/zhiqiang/.node-red/circuit_img.png';
      shellScript += util.format(snippets.CIRCUIT_DRAW);
      await shell.execute(shellScript, (err, data) => {
        if (err) node.error(err);
        else {
          // print the diagram to debug console
          node.warn(data);
          // pass the quantum register config to the output
          send(msg);
        }
      });
      shell.stop();
    });
  }

  RED.nodes.registerType('circuit-output', CircuitOutputNode);
};
