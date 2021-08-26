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
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

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
            msg.payload.registerVar + '[' + msg.payload.qubit + ']',
        );
      }

      // Run the script in the python shell, and if no error occurs
      // then send msg object to the next node
      await shell.execute(script, (err) => {
        if (err) done(err);
        else {
          send(msg);
          node.status({
            fill: 'grey',
            shape: 'dot',
            text: node.axis.toUpperCase() + ' axis: \xa0' + node.angle.toString() + '\u03C0',
          });
          done();
        };
      });
    });
  }
  RED.nodes.registerType('rotation-gate', RotationGateNode);
};
