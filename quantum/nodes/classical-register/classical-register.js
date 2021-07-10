module.exports = function(RED) {
  'use strict';
  let classicalRegister = null;
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    classicalRegister = this;
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.classicalBits = parseInt(config.classicalBits);
    const globalContext = this.context().global;
    const util = require('util');
    const dedent = require('dedent-js');
    const node = this;
    this.registerVar = 'cr' + node.id.replace('.', '_');

    this.on('input', function(msg, send, done) {
      // Throw a connection error if:
      // - The user did not initialise the quantum circuit using the 'Quantum Circuit' node
      // - The user did not select the 'Registers & Bits' option in the 'Quantum Circuit' node
      // - The user connects the node incorrectly
      if (typeof(globalContext.get('quantumCircuit')) == 'undefined') {
        throw new Error('Quantum circuits must be initialised using the "Quantum Circuit" node.');
      } else if (msg.payload.register === 'no registers' && msg.topic === 'Quantum Circuit') {
        throw new Error('Select "Registers & Bits" in the "Quantum Circuit" node properties to use registers.');
      } else if (typeof(msg.payload.register) !== 'number' && msg.topic === 'Quantum Circuit') {
        throw new Error('Register nodes must be connected to the outputs of the "Quantum Circuit" node.');
      } else if (msg.topic !== 'Quantum Circuit') {
        throw new Error('Register nodes must be connected to nodes from the quantum library only');
      } else {
        // If no connection errors
        // Appending Qiskit script to the 'script' global variable
        let qiskitScript = dedent(`
          cr%s = ClassicalRegister(%s, %s)

        `);
        qiskitScript = util.format(qiskitScript,
            node.id.replace('.', '_'),
            node.classicalBits,
            (node.name || ('R' + msg.payload.register.toString())),
        );

        let oldScript = globalContext.get('script');
        globalContext.set('script', oldScript + qiskitScript);

        // Completing the 'structure' global array
        const structure = globalContext.get('quantumCircuit.structure');
        structure[msg.payload.register] = {
          registerType: 'classical',
          registerName: (node.name || ('R' + msg.payload.register.toString())),
          registerVar: 'cr' + node.id.replace('.', '_'),
          bits: node.classicalBits,
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
  // Defining post request handler for this node to save its config values
  // to frontend variable
  RED.httpAdmin.post('/classical-register', RED.auth.needsPermission('classical-register.read'), function(req, res) {
    classicalRegister.classicalBits = req.body.cbits;
    res.json({success: true});
  });

  // Defining get request handler for other nodes to get latest data on
  // number of classical bits and variable name;
  RED.httpAdmin.get('/classical-register', RED.auth.needsPermission('classical-register.read'), function(req, res) {
    res.json({
      bits: classicalRegister.classicalBits,
      registerVar: classicalRegister.registerVar,
    });
  });
  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
