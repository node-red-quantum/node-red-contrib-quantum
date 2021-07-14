'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function HadamardGate(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg, send, done) => {
      let qrConfig = msg.payload;
      let keys = Object.keys(qrConfig);
      if (!keys.includes('register') || !keys.includes('qubit')) {
        throw new Error('Invalid Input');
      }
      // show the status of the node
      node.status({
        fill: 'grey',
        shape: 'dot',
        text: qrConfig.register ? `Register ${qrConfig.register} / Qubit ${qrConfig.qubit}` :
          `Qubit ${qrConfig.qubit}`,
      });
      let shellScript = util.format(snippets.HADAMARD_GATE, qrConfig.register ? 
        `${qrConfig.register}[${qrConfig.qubit}]` :
        `${qrConfig.qubit}`);
      await shell.execute(shellScript, (err) => {
        if (err) node.error(err);
      });
      // pass the quantum register config to the output
      send(msg);
    })
  }

  RED.nodes.registerType('hadamard-gate', HadamardGate);
};
  