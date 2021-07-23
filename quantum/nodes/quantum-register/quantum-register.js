'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.outputs = parseInt(config.outputs);
    const flowContext = this.context().flow;
    const output = new Array(this.outputs);
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
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

      // Setting node.name to "r0","r1"... if the user did not input a name
      if (node.name == '') {
        node.name = 'r' + msg.payload.register.toString();
      }

      // Add arguments to quantum register code
      script += util.format(snippets.QUANTUM_REGISTER,
          msg.payload.register.toString(),
          node.outputs.toString() + ', "' + node.name + '"',
      );

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'quantum',
        registerName: node.name,
        registerVar: 'qr' + msg.payload.register.toString(),
      };
      flowContext.set('quantumCircuit[' + msg.payload.register.toString() + ']', register);

      // get quantum circuit config and circuit ready event from flow context
      let quantumCircuitConfig = flowContext.get('quantumCircuitConfig');
      let circuitReady = flowContext.get('isCircuitReady');
      quantumCircuitConfig[node.name] = register;

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(flowContext.get('quantumCircuit')) !== undefined) {
        // Counting the number of registers that were set in the 'quantumCircuit' array
        let structure = flowContext.get('quantumCircuit');

        let count = 0;
        let qreg = 0;
        let creg = 0;
        structure.map((x) => {
          if (typeof(x) !== 'undefined') {
            count += 1;
            if (x.registerType === 'quantum') qreg += 1;
            else creg += 1;
          }
        });

        // If the user specified a register structure in the 'Quantum Circuit' node that
        // does not match the visual structure built using the register nodes, throw an error
        if (qreg > msg.payload.structure.qreg || creg > msg.payload.structure.creg) {
          throw new Error(
              'Please enter the correct number of quantum & classical registers in the "Quantum Circuit" node.',
          );

        // If all set & the quantum circuit has not yet been initialised by another register:
        // Initialise the quantum circuit
        } else if (count == structure.length && typeof(flowContext.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' flow context variable, not used anymore
          flowContext.set('quantumCircuit', undefined);

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          script += circuitScript;
        }
      }

      // Creating an array of messages to be sent
      // Each message represents a different qubit
      for (let i = 0; i < node.outputs; i++) {
        output[i] = {
          topic: 'Quantum Circuit',
          payload: {
            structure: msg.payload.structure,
            register: node.name,
            registerVar: 'qr' + msg.payload.register.toString(),
            totalQubits: node.outputs,
            qubit: i,
          },
        };
      }

      // Run the script in the python shell, and if no error occurs
      // then send one qubit object per node output
      await shell.execute(script, (err) => {
        if (err) {
          node.error(err);
        }
        else {
          // wait for quantum circuit to be initialised
          await circuitReady();
          send(output);
        }
      });
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
