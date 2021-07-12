module.exports = function (RED) {
  "use strict";

  function ToffoliGateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.outputs = config.outputs;
    this.controlQubit1 = config.controlQubit1;
    this.controlQubit2 = config.controlQubit2;
    this.targetQubit = config.targetQubit;
    const globalContext = this.context().global;
    const output = new Array(node.outputs);

    //Access the message payload to get the 3 qubit inputs.
    //Wait until the gate has all 3 qubits
    //Apply qiskit code 'cxx(Control-q1, Control-q2, Target-q3)
    //Output the three qubits

    node.on("input", function (msg, send, done) {
      let qrConfig = msg.payload;

      if (qrConfig.length == 3) {
      }

      send(output);
    });
  }

  RED.nodes.registerType("toffoli-gate", ToffoliGateNode);
};
