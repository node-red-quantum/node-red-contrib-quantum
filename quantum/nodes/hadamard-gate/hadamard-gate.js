'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function HadamardGateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg, send, done) => {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Throw corresponding errors if required.
      errors.validateQubitInput(node, msg);

      let qrConfig = msg.payload;
      script += util.format(snippets.HADAMARD_GATE,
        qrConfig.register ? `${qrConfig.register}[${qrConfig.qubit}]` : `${qrConfig.qubit}`);

      // execute the script and pass the quantum register config to the output if no errors occurred
      await shell.execute(script, (err) => {
        if (err) node.error(err);
        else send(msg);
      });
    });
  }

  RED.nodes.registerType('hadamard-gate', HadamardGateNode);
};
