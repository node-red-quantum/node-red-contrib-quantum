'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {

  function DiagramOutputNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg, send, done) => {
      console.log(`diagram-output: ${msg}`);
      let shellScript = snippets.PRINT_DIAGRAM;
      await shell.execute(shellScript, (err, data) => {
        if (err) node.error(err);
        // print the diagram to debug console
        node.warn(data);
        console.log(data);
      });
      shell.stop();
      // pass the quantum register config to the output
      send(msg);
    })
  }

  RED.nodes.registerType('diagram-output', DiagramOutputNode);
};
