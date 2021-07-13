'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function BarrierNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    this.qubits = [];
    const node = this;

    this.on('input', async function(msg, send, done) {
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - The user chooses to use registers but does not initiate them
      // - The user inputs more qubits than selected in the node properties
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'Quantum barrier nodes must be connected to nodes from the quantum library only.',
        );
      } else if (typeof(msg.payload.register) === 'undefined' && typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'Quantum barrier nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      } else if (node.qubits.length >= node.outputs) {
        throw new Error(
            'Please inputs the same number of qubits than selected in the node properties.',
        );
      }
      // Store all the qubit objects received as input into the node.qubits array
      // If all qubits have arrived, we first reorder the node.qubits array for output consistency
      // Finally, we run the barrier script in the python shell and send the qubits as output
      node.qubits.push(msg);

      if (node.qubits.length == node.outputs) {
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

        let barrierScript = util.format(snippets.BARRIER, '%s,'.repeat(node.outputs));
        node.qubits.map((msg) => {
          if (typeof(msg.payload.register) === 'undefined') {
            barrierScript = util.format(barrierScript,
                msg.payload.qubit.toString());
          } else {
            barrierScript = util.format(barrierScript,
                msg.payload.registerVar + '[' + msg.payload.qubit.toString() + ']');
          }
        });

        await shell.execute(barrierScript, (err) => {
          if (err) node.error(err);
        });

        // Sending one qubit object per node output
        send(node.qubits);
      }
    });
  }

  RED.nodes.registerType('barrier', BarrierNode);
};
