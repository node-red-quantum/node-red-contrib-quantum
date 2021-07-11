'use strict';

const util = require('util');
const dedent = require('dedent-js');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.classicalBits = parseInt(config.classicalBits);
    const flowContext = this.context().flow;
    const node = this;

    this.on('input', function(msg, send, done) {
      // Throw a connection error if:
      // - The user did not initialise the quantum circuit using the 'Quantum Circuit' node
      // - The user did not select the 'Registers & Bits' option in the 'Quantum Circuit' node
      // - The user connects the node incorrectly
      if (typeof(flowContext.get('quantumCircuit')) == 'undefined') {
        throw new Error(
            'Quantum circuits must be initialised using the "Quantum Circuit" node.',
        );
      } else if (msg.payload.register === 'no registers' && msg.topic === 'Quantum Circuit') {
        throw new Error(
            'Select "Registers & Bits" in the "Quantum Circuit" node properties to use registers.',
        );
      } else if (typeof(msg.payload.register) !== 'number' && msg.topic === 'Quantum Circuit') {
        throw new Error(
            'Register nodes must be connected to the outputs of the "Quantum Circuit" node.',
        );
      } else if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'Register nodes must be connected to nodes from the quantum library only',
        );
      } else {
        // If no connection errors
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript = dedent(`
          cr%s = ClassicalRegister(%s, %s)

        `);
        qiskitScript = util.format(qiskitScript,
            msg.payload.register,
            node.classicalBits,
            (node.name.toLowerCase() || ('r' + msg.payload.register.toString())),
        );

        let oldScript = flowContext.get('script');
        flowContext.set('script', oldScript + qiskitScript);

        // Completing the 'structure' global array
        const structure = flowContext.get('quantumCircuit.structure');
        structure[msg.payload.register] = {
          registerType: 'classical',
          registerName: (node.name.toLowerCase() || ('r' + msg.payload.register.toString())),
          registerVar: 'cr' + msg.payload.register.toString(),
          bits: node.classicalBits,
        };
        flowContext.set('quantumCircuit.structure', structure);

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

        // Notify the runtime when the node is done.
        if (done) {
          done();
        }
      }
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
