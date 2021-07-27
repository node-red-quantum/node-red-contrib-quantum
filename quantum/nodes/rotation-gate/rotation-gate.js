'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function RotationGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.axis = config.axis;
    this.angle = config.angle;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Throw corresponding errors if required.
      errors.validateQubitInput(node, msg);

      if (typeof msg.payload.register === 'undefined') {
        script += util.format(snippets.ROTATION_GATE,
            node.axis,
            node.angle + '*pi',
            msg.payload.qubit,
        );
      } else {
        script += util.format(snippets.ROTATION_GATE,
            node.axis,
            node.angle + '*pi',
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
            text: node.axis.toUpperCase() + ' axis: \xa0' + node.angle.toString() + '\u03C0',
          });
        };
      });
    });
  }
  RED.nodes.registerType('rotation-gate', RotationGateNode);
};
