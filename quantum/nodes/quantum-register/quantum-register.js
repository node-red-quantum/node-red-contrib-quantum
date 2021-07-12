'use strict';

const util = require('util');
const dedent = require('dedent-js');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.outputs = parseInt(config.outputs);
    const flowContext = this.context().flow;
    const node = this;
    const output = new Array(node.outputs);

    this.on('input', function(msg, send, done) {
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
      } else {
        // If no connection errors
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript = dedent(`
          qr%s = QuantumRegister(%s, %s)

        `);
        qiskitScript = util.format(qiskitScript,
            msg.payload.register,
            node.outputs,
            (node.name.toLowerCase() || ('r' + msg.payload.register.toString())),
        );

        let oldScript = flowContext.get('script');
        flowContext.set('script', oldScript + qiskitScript);

        // Completing the 'structure' global array
        const structure = flowContext.get('quantumCircuit');
        structure[msg.payload.register] = {
          registerType: 'quantum',
          registerVar: 'qr' + msg.payload.register.toString(),
        };
        flowContext.set('quantumCircuit', structure);

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
          qiskitScript = dedent(`
             
            qc = QuantumCircuit(
          `);

          structure.map((register) => {
            qiskitScript += '%s, ';
            qiskitScript = util.format(qiskitScript, register.registerVar);
          });

          qiskitScript = qiskitScript.substring(0, qiskitScript.length - 2);
          qiskitScript += dedent(`
            ) 
            \n
          `);

          // Appending the code to the 'script' global variable
          oldScript = flowContext.get('script');
          flowContext.set('script', oldScript + qiskitScript);
          flowContext.set('quantumCircuit', null);
        }
        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: (node.name.toLowerCase() || ('r' + msg.payload.register.toString())),
              registerVar: 'qr' + msg.payload.register.toString(),
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
