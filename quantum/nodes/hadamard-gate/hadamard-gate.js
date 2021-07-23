'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function HadamardGateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg, send, done) => {
      let script = '';
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
      script += util.format(snippets.HADAMARD_GATE,
        qrConfig.register ? `q${qrConfig.register}[${qrConfig.qubit}]` : `${qrConfig.qubit}`);

      // execute the script and pass the quantum register config to the output if no errors occurred
      await shell.execute(script, (err) => {
        if (err) node.error(err);
        else send(msg);
      });
    });
  }

  RED.nodes.registerType('hadamard-gate', HadamardGateNode);
};
