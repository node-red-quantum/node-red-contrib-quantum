module.exports = function (RED) {
  "use strict";

  const util = require("util");
  const snippets = require("../../snippets");
  const shell = require("../../python").PythonShell;
  const errors = require("../../errors");

  function IBMQuantumSystemNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const apiToken = config.api_token;
    const preferredBackend = config.preferred_backend;
    const outputPreference = config.preferred_output;
    this.qubits = [];
    this.qreg = "";

    this.on("input", async function (msg, send, done) {
      let qubitsArrived = true;

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

      // If the quantum circuit does not have registers
      if (typeof msg.payload.register === "undefined") {
        node.qreg = undefined;
        node.qubits.push(msg);

        // If not all qubits have arrived
        if (node.qubits.length < msg.payload.structure.qubits) {
          qubitsArrived = false;
        }
      } else {
        // If the quantum circuit has registers
        // Keep track of qubits that have arrived and the remaining ones
        if (node.qubits.length == 0) node.qreg = {};

        // Throw an error if too many qubits are received by the quantum system node
        // because the user connected qubits from different quantum circuits
        if (
          (!Object.keys(node.qreg).includes(msg.payload.registerVar) &&
            Object.keys(node.qreg).length == msg.payload.structure.qreg) ||
          (Object.keys(node.qreg).includes(msg.payload.registerVar) &&
            node.qreg[msg.payload.registerVar].count ==
              node.qreg[msg.payload.registerVar].total)
        ) {
          done(new Error(errors.QUBITS_FROM_DIFFERENT_CIRCUITS));
        }

        // Storing information about which qubits were received
        if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }

        node.qubits.push(msg);

        // Checking whether all qubits have arrived or not
        Object.keys(node.qreg).map((key) => {
          if (node.qreg[key].count < node.qreg[key].total) {
            qubitsArrived = false;
          }
        });
      }

      // If all qubits have arrived,
      // generate the quantum system script and run it
      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          return;
        }

        node.status({
          fill: "orange",
          shape: "dot",
          text: "Job running...",
        });

        // Emptying the runtime variables upon output
        node.qubits = [];
        node.qreg = "";

        let script = "";

        if (outputPreference == "Verbose") {
          script += util.format(
            snippets.IBMQ_SYSTEM_VERBOSE,
            apiToken,
            preferredBackend
          );
        } else {
          script += util.format(
            snippets.IBMQ_SYSTEM_RESULT,
            apiToken,
            preferredBackend
          );
        }

        shell.execute(script, (err, data) => {
          if (err) {
            node.error(err, msg);
          } else {
            msg.payload = data;
            send(msg);

            done();

            node.status({
              fill: "green",
              shape: "dot",
              text: "Job completed!",
            });
          }
        });
      }
    });
  }

  RED.nodes.registerType("ibm-quantum-system", IBMQuantumSystemNode);
};
