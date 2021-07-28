'use strict';

const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function ScriptNode(config) {
    RED.nodes.createNode(this, config);

    this.on('input', function(msg, send, done) {
      msg.payload = shell.script.trim();
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('script', ScriptNode);
};
