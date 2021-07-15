module.exports = function(RED) {
  'use strict';

  function SimulatorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('simulator', SimulatorNode);
};
