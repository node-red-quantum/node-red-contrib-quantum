const snippets = require('../../snippets');

module.exports = function(RED) {
  'use strict';

  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    const globalContext = this.context().global;
    const util = require('util');
    const node = this;
    const output = new Array(node.outputs);

    this.on('input', function(msg, send, done) {
      // Throw a connection error if:
      // - The user did not initialise the quantum circuit using the 'Quantum Circuit' node
      // - The user did not select the 'Registers & Bits' option in the 'Quantum Circuit' node
      // - The user connects the node incorrectly
      if (typeof(globalContext.get('quantumCircuit')) == 'undefined') {
        throw new Error('Quantum circuits must be initialised using the "Quantum Circuit" node.');
      } else if (msg.payload.register === 'no registers' && msg.topic === 'Quantum Circuit') {
        throw new Error('Select "Registers & Qubits" in the "Quantum Circuit" node properties to use registers.');
      } else if (typeof(msg.payload.register) !== 'number' && msg.topic === 'Quantum Circuit') {
        throw new Error('Register nodes must be connected to the outputs of the "Quantum Circuit" node.');
      } else if (msg.topic !== 'Quantum Circuit') {
        throw new Error('Register nodes must be connected to nodes from the quantum library only');
      } else {
        // If no connection errors
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript = util.format(snippets.QUANTUM_REGISTER,
            msg.payload.register,
            node.outputs + ',' +
            (node.name || ('R' + msg.payload.register.toString())),
        );

        let oldScript = globalContext.get('script');
        globalContext.set('script', oldScript + qiskitScript);

        // Completing the 'structure' global array
        const structure = globalContext.get('quantumCircuit.structure');
        structure[msg.payload.register] = {
          registerType: 'quantum',
          registerName: (node.name || ('R' + msg.payload.register.toString())),
          registerVar: 'qr' + msg.payload.register.toString(),
          bits: node.outputs,
        };
        globalContext.set('quantumCircuit.structure', structure);

        // Counting the number of registers that were set in the 'structure' array
        let count = 0;
        structure.map((x) => {
          if (typeof(x) !== 'undefined') {
            count += 1;
          }
        });

        // If they are all set: initialise the quantum circuit
        if (count == structure.length) {
          // Generating the corresponding Qiskit script
          qiskitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            qiskitScript = util.format(qiskitScript, register.registerVar);
          });

          // Appending the code to the 'script' global variable
          oldScript = globalContext.get('script');
          globalContext.set('script', oldScript + qiskitScript);
        }
        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: 'qr' + msg.payload.register.toString(),
              qubit: i,
            },
          };
        };

        // Sending one qubit object per node output
        send(output);
      }
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
