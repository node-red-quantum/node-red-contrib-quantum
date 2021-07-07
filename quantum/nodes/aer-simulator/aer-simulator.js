module.exports = function(RED) {
  'use strict';

  function AerSimulatorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('aer-simulator', AerSimulatorNode);
};
