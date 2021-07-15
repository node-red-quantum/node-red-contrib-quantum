'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    const flowContext = this.context().flow;
    const output = new Array(this.outputs);
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

      // Add arguments to quantum register code
      let registerScript = util.format(snippets.QUANTUM_REGISTER,
          msg.payload.register.toString(),
          node.outputs.toString() + ',' +
            (('"' + node.name + '"') || ('"r' + msg.payload.register.toString() + '"')),
      );
      await shell.execute(registerScript, (err) => {
        if (err) node.error(err);
      });
      // Completing the 'structure' global array
      let structure = flowContext.get('quantumCircuit');
      structure[msg.payload.register] = {
        registerType: 'quantum',
        registerName: (node.name || ('r' + msg.payload.register.toString())),
        registerVar: 'qr' + msg.payload.register.toString(),
        bits: node.outputs,
      };
      flowContext.set('quantumCircuit', structure);

      // Counting the number of registers that were set in the 'structure' array
      let count = 0;
      structure.map((x) => {
        if (typeof (x) !== 'undefined') {
          count += 1;
        }
      });

      // If they are all set: initialise the quantum circuit
      if (count == structure.length) {
        // Add arguments to quantum circuit code

        let params = '';
        structure.map((register) => {
          params += register.registerVar + ',';
        });
        let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, params);
        console.log('circuit script = ',circuitScript);
        await shell.execute(circuitScript, (err) => {
          if (err) node.error(err);
        });

        flowContext.set('quantumCircuit', undefined);
      }

      // Creating an array of messages to be sent
      // Each message represents a different qubit
      for (let i = 0; i < node.outputs; i++) {
        output[i] = {
          topic: 'Quantum Circuit',
          payload: {
            register: (node.name || ('r' + msg.payload.register.toString())),
            registerVar: 'qr' + msg.payload.register.toString(),
            qubit: i,
          },
        };
      }
      // Sending one qubit object per node output
      send(output);
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
