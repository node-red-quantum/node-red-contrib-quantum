'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function UGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.theta = config.theta;
    this.phi = config.phi;
    this.lambda = config.lambda;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
      // Thorw error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - the user chooses to use registers but does not initiate them
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'The U gate node must be connected to nodes from the quantum library only.',
        );
      } else if (
        typeof msg.payload.register === 'undefined' &&
        typeof msg.payload.qubit === 'undefined'
      ) {
        throw new Error(
            'The U gate node must be receive qubits objects as inputs.\n' +
            'Please use "Quantum Circut" and "Quantum Register" node to generate qubits objects.',
        );
      } else if (
        typeof msg.payload.qubit === 'undefined'
      ) {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      }

      if (typeof msg.payload.register === 'undefined') {
        script += util.format(snippets.U_GATE,
            node.theta + '*pi',
            node.phi + '*pi',
            node.lambda + '*pi',
            msg.payload.qubit,
        );
      } else {
        script += util.format(snippets.U_GATE,
            node.theta + '*pi',
            node.phi + '*pi',
            node.lambda + '*pi',
            `msg.payload.registerVar + '[' + msg.payload.qubit + ']'`,
        );
      }

      // Run the script in the python shell, and if no error occurs
      // then send msg object to the next node
      await shell.execute(script, (err) => {
        if (err) node.error(err);
        else {
          send(msg);

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: (
              node.theta.toString() + '\u03C0, ' +
              node.phi.toString() + '\u03C0, ' +
              node.lambda.toString() + '\u03C0'
            ),
          });
        };
      });
    });
  }
  RED.nodes.registerType('u-gate', UGateNode);
};
