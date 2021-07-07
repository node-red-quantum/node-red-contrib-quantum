module.exports = function (RED) {
  "use strict";

  function ToffoliGateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on("input", function (msg, send, done) {});
  }

  RED.nodes.registerType("toffoli-gate", ToffoliGateNode);
};
