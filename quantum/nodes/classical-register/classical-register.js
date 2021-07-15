'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(' ', '_');
    this.classicalBits = config.classicalBits;
    const flowContext = this.context().flow;
    const node = this;

    this.on('input', async function(msg, send, done) {
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user did not select the 'Registers & Bits' option in the 'Quantum Circuit' node
      // - The user does not connect the register node to the output of the 'Quantum Circuit' node
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'Register nodes must be connected to nodes from the quantum library only',
        );
      } else if (typeof(msg.payload.register) === 'undefined') {
        throw new Error(
            'Select "Registers & Qubits" in the "Quantum Circuit" node properties to use registers.',
        );
      } else if (typeof(msg.payload.register) !== 'number') {
        throw new Error(
            'Register nodes must be connected to the outputs of the "Quantum Circuit" node.',
        );
      }

      // Add arguments to classical register code
      let registerScript = util.format(snippets.CLASSICAL_REGISTER,
          '_' + node.name,
          node.classicalBits.toString() + ', "' + node.name + '"',
      );
      await shell.execute(registerScript, (err) => {
        if (err) node.error(err);
      });

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'classical',
        registerName: node.name,
        registerVar: 'cr_' + node.name,
        bits: node.classicalBits,
      };
      flowContext.set('quantumCircuit[' + msg.payload.register.toString() + ']', register);

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(flowContext.get('quantumCircuit')) !== undefined) {
        // Counting the number of registers that were set in the 'quantumCircuit' array
        let structure = flowContext.get('quantumCircuit');

        let count = 0;
        structure.map((x) => {
          if (typeof(x) !== 'undefined') {
            count += 1;
          }
        });

        // If all set & the quantum circuit has not yet been initialised by another register:
        // Initialise the quantum circuit
        if (count == structure.length && typeof(flowContext.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' flow context variable, not used anymore
          flowContext.set('quantumCircuit', undefined);

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          await shell.execute(circuitScript, (err) => {
            if (err) node.error(err);
          });
        }
      }

      // Notify the runtime when the node is done.
      if (done) {
        done();
      }
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
