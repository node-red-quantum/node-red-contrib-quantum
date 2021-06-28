module.exports = function(RED) {
  'use strict';

  function NodeTemplateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  RED.nodes.registerType('node-template', NodeTemplateNode);
};
