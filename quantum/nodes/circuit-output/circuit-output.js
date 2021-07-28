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
      console.log(`circuit-output: ${msg}`);
      const params = '/Users/happysky/.node-red/static/circuit_img.png';
      shellScript += util.format(snippets.CIRCUIT_DRAW, params);
      await shell.execute(shellScript, (err, data) => {
        if (err) node.error(err);
        // print the diagram to debug console
        node.warn(data);
        console.log(data);
      });
      shell.stop();
      // pass the quantum register config to the output
      send(msg);
    });
  }

  RED.nodes.registerType('circuit-output', CircuitOutputNode);
};
