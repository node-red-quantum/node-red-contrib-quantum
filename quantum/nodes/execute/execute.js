module.exports = function(RED) {
  'use strict';

  const shell = require('../../python-shell');

  function ExecuteNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', function(msg) {
      shell.runString(msg.payload, null, function(err, output) {
        if (err) {
          node.error(err);
        } else {
          msg.payload = output;
          node.send(msg);
        }
      });
    });
  }

  RED.nodes.registerType('execute', ExecuteNode);
};
