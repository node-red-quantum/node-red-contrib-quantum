'use strict';

const errors = require('../../errors');

module.exports = function(RED) {
  function QubitNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    this.on('input', function(msg, send, done) {
      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

      // Using node status to inform the user of which qubit is being transmitted
      if (typeof(msg.payload.register) === 'undefined') {
        node.status({
          fill: 'grey',
          shape: 'dot',
          text: 'Qubit ' + msg.payload.qubit.toString(),
        });
      } else {
        node.status({
          fill: 'grey',
          shape: 'dot',
          text: 'Register ' + msg.payload.register + ' / Qubit ' + msg.payload.qubit.toString(),
        });
      }

      // Simply return the msg received without any operations
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('qubit', QubitNode);
};
