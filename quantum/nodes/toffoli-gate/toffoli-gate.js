'use strict';
const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function (RED) {
  let targetPosition = document.getElementById("target-position").value;

  function ToffoliGateNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    const node = this;

    node.on("input", async function (msg, send, done) {
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - The user chooses to use registers but does not initiate them
      // - The user inputs more qubits than selected in the node properties
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'The Toffoli Gate must be connected to nodes from the quantum library only.',
        );
      } else if (typeof(msg.payload.register) === 'undefined' && typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'The Toffoli Gate nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      } else if (node.qubits.length >= 3) {
        throw new Error(
            'The Toffoli Gate requires exactly 3 input qubits to be used.',
        );
      }

      // Store all the qubit objects received as input into the node.qubits array
      node.qubits.push(msg);

      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      if (node.qubits.length == 3) {
        node.qubits.sort(function compare(a, b) {
          if (typeof(a.payload.register) !== 'undefined') {
            const regA = parseInt(a.payload.registerVar.slice(2));
            const regB = parseInt(b.payload.registerVar.slice(2));
            if (regA < regB) return -1;
            else if (regA > regB) return 1;
            else {
              if (a.payload.qubit < b.payload.qubit) return -1;
              else return 1;
            }
          } else {
            if (a.payload.qubit < b.payload.qubit) return -1;
            else return 1;
          }
        });

        if(targetPosition == 'top') {
          let target = node.qubits[0];
          let control1 = node.qubits[1];
          let control2 = node.qubits[2]
        }
        else if(targetPosition == 'middle') {
          let target = node.qubits[1];
          let control1 = node.qubits[0];
          let control2 = node.qubits[2]
        }
        else {
          let target = node.qubits[2];
          let control1 = node.qubits[0];
          let control2 = node.qubits[1]
        }

        // Generate the corresponding barrier Qiskit script
        let toffoliCode = util.format(snippets.TOFFOLI, '%s,'.repeat(node.outputs));
        node.qubits.map((msg) => {
          if (typeof(msg.payload.register) === 'undefined') {
            toffoliCode = util.format(toffoliCode,
            control1.qubit.toString(), control2.qubit.toString(), target.qubit.toString());
          } else {
            toffoliCode = util.format(toffoliCode,
            control1.registerVar + '[' + control1.qubit.toString() + ']', 
            control2.registerVar + '[' + control2.qubit.toString() + ']', 
            target.registerVar + '[' + target.qubit.toString() + ']');
          }
        });

        // Run the script in the python shell
        await shell.execute(toffoliCode, (err) => {
        if (err) node.error(err);
        });

        // Sending one qubit object per node output
        send(node.qubits);
      });
    }
  
  RED.nodes.registerType("toffoli-gate", ToffoliGateNode);
};
