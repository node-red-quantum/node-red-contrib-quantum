module.exports = function(RED) {
  'use strict';

  function ClassicalRegisterNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
