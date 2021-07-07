module.exports = function(RED) {
  'use strict';

  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.classicalBits = config.classicalBits;
    const globalContext = this.context().global;
    const node = this;

    this.on('input', function(msg, send, done) {
      // Throws an error if:
      // - The user did not initialise the quantum circuit using the 'Quantum Circuit' node
      // - The user did not select the 'Registers & Bits' option in the 'Quantum Circuit' node
      // - The user connects the node incorrectly
      if (typeof(globalContext.get('quantumCircuit')) == 'undefined') {
        throw 'Quantum circuits must be initialised using the "Quantum Circuit" node.';
      } else if (msg.payload.register === 'no registers' && msg.topic === 'Quantum Circuit') {
        throw 'Select the "Registers & Qubits" option in the "Quantum Circuit" node properties to use registers.';
      } else if (typeof(msg.payload.register) !== 'number' && msg.topic === 'Quantum Circuit') {
        throw 'Register nodes must be connected to the outputs of the "Quantum Circuit" node.';
      } else if (msg.topic !== 'Quantum Circuit') {
        throw 'Register nodes must be connected to nodes from the quantum library only';
      }
      // If no connection errors
      else {
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript = (
          '\ncr' + msg.payload.register.toString() +
          ' = ClassicalRegister(' + node.classicalBits.toString() +
          ', \'' + (node.name || ('R' + msg.payload.register.toString())) + '\')'
        );
        let oldScript = globalContext.get('script');
        globalContext.set('script', oldScript + qiskitScript);

        // Completing the 'structure' global array
        const structure = globalContext.get('quantumCircuit.structure');
        structure[msg.payload.register] = {
          registerType: 'classical',
          registerName: (node.name || ('R' + msg.payload.register.toString())),
          registerVar: 'cr' + msg.payload.register.toString(),
          bits: parseInt(node.classicalBits),
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
          qiskitScript = '\n \nqc = QuantumCircuit(';
          structure.map((register) => {
            if (register.registerType === 'quantum') {
              qiskitScript += ('qr' + structure.indexOf(register) + ',');
            } else {
              qiskitScript += ('cr' + structure.indexOf(register) + ',');
            }
          });
          qiskitScript = qiskitScript.substring(0, qiskitScript.length - 1);
          qiskitScript += ') \n';

          // Appending the code to the 'script' global variable
          oldScript = globalContext.get('script');
          globalContext.set('script', oldScript + qiskitScript);
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
