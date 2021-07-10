module.exports = function (RED) {
    "use strict";

    function CNotGateNode(config) {
      // Creating node with properties and context
      RED.nodes.createNode(this, config);
      this.name = config.name;
      this.outputs = config.outputs;
      this.controlQubit1 = config.controlQubit1;
      this.targetQubit = config.targetQubit;
      const globalContext = this.context().global;
      const node = this;
      const output = new Array(node.outputs);

      //Connect gate to 2 quantum registers as input, indicating which input are the controls and which is the target
      //Add the inputs to the qiskit code 'qc = cx(qr1, qr2)' and append to the script
      //Output qr1 and qr2 from gate.

      this.on("input", function (msg, send, done) {
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript =
          "\nqc = cx(" +
          this.controlQubit1 +
          ", " +
          this.targetQubit +
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

    RED.nodes.registerType("cnot-gate", CNotGateNode);
  };
