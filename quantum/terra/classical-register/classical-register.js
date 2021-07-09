module.exports = function(RED) {
  'use strict';
  let classicalRegister = null;
  function ClassicalRegisterNode(config) {
    // Creating node with properties and context
    classicalRegister = this;
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.classicalBits = config.classicalBits;
    const globalContext = this.context().global;
    const node = this;
    this.registerVar = 'cr' + node.id.replace('.', '_');

    this.on('input', function(msg, send, done) {
      // Appending Qiskit script to the 'script' global variable
      let qiskitScript = (
        '\ncr' + node.id.replace('.', '_') +
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
        registerVar: 'cr' + 'cr' + node.id.replace('.', '_'),
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
            qiskitScript += ('cr' + node.id.replace('.', '_') + ',');
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
