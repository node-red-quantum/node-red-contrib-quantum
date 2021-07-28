'use strict';

module.exports = function(RED) {
  function ScriptNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('script', ScriptNode);
};
