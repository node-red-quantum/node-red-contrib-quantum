'use strict';

const shell = require('../../python').PythonShell;
const logger = require('../../logger');

module.exports = function(RED) {
  function ScriptNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    logger.trace(this.id, 'Initialised script');

    this.on('input', function(msg, send, done) {
      logger.trace(node.id, 'Script received input');
      msg.payload = shell.script.trim();
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('script', ScriptNode);
};
