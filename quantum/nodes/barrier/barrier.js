'use strict';

const util = require('util');
const dedent = require('dedent-js');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function BarrierNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    const node = this;
    const output = new Array(node.outputs);

    this.on('input', function(msg, send, done) {
      // Sending one register object per node output
      send(output);
    });
  }

  RED.nodes.registerType('barrier', BarrierNode);
};
