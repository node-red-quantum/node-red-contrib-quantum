module.exports = function (RED) {
  "use strict";

  function ToffoliGateNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = config.outputs;
    const globalContext = this.context().global;
    const node = this;
    const output = new Array(node.outputs);

    //Connect gate to 3 quantum registers as input, indicating which input are the controls and which is the target
    //Add the inputs to the qiskit code ' qc = ccx(qr1, qr2, qr3)' and append to the script
    //Output qr1, qr2 and qr3 from gate.

    this.on("input", function (msg, send, done) {
      // Appending Qiskit script to the 'script' global variable
      let qiskitScript =
        "\nqc = ccx(" +
        document.getElementById("control-qubit-1").value +
        ", " +
        document.getElementById("control-qubit-2").value +
        ", " +
        document.getElementById("target-qubit").value +
        ")";

      let oldScript = globalContext.get("script");
      globalContext.set("script", oldScript + qiskitScript);

      // Creating an array of messages to be sent
      // Each message represents a different qubit
      for (let i = 0; i < node.outputs; i++) {
        output[i] = {
          topic: "Quantum Circuit",
          payload: {
            register: "qr" + msg.payload.register.toString(),
            qubit: i,
          },
        };
      }

      // Sending one qubit object per node output
      send(output);
    });
  }

  RED.nodes.registerType("toffoli-gate", ToffoliGateNode);
};
