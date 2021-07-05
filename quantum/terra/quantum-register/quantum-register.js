module.exports = function(RED) {
  'use strict';

  function QuantumRegisterNode(config) {

    // Creating node with properties and context 
    RED.nodes.createNode(this, config);
    this.outputs = config.outputs;
    const globalContext = this.context().global;
    const node = this;

    this.on('input', function(msg, send, done) {

      // Appending Qiskit script to the 'script' global variable
      var qiskitScript = (
        "\nqr" + msg.payload.register.toString() + 
        " = QuantumRegister(" + this.outputs.toString() + 
        ", '" + (this.name || ("R" + msg.payload.register.toString())) + "')"
      );
      var oldScript = globalContext.get("script");
      globalContext.set("script", oldScript + qiskitScript);

      // Completing the 'structure' global array 
      var structure = globalContext.get("structure");
      structure[msg.payload.register] = {
        registerType: "quantum",
        registerName: (this.name || ("R" + msg.payload.register.toString())),
        registerVar: "qr" + msg.payload.register.toString(),
        bits: this.outputs
      };
      globalContext.set("structure", structure);
      
      // Counting the number of registers that were set in the 'structure' array
      var count = 0;
      structure.map(x => {
        if (typeof(x) !== "undefined"){
          count += 1
        }
      });

      // If they are all set: initialise the quantum circuit
      if (count == structure.length) {

        // Generating the corresponding Qiskit script
        qiskitScript = "\n \nqc = QuantumCircuit(";
        structure.map(register => {
          if (register.registerType === "quantum") {
            qiskitScript += ("qr" + structure.indexOf(register) + ",");
          } else {
            qiskitScript += ("cr" + structure.indexOf(register) + ",");
          }
        })
        qiskitScript = qiskitScript.substring(0,qiskitScript.length - 1);
        qiskitScript += ") \n";
        
        // Appending the code to the 'script' global variable
        oldScript = globalContext.get("script");
        globalContext.set("script", oldScript + qiskitScript);
      }

      // Creating an array of messages to be sent 
      // Each message represents a different qubit
      var i = 0;
      var output = new Array(this.outputs);
      for (i=0; i<this.outputs; i++){
        output[i] = {
          topic: "Quantum Circuit",
          payload: {
            register: "qr" + msg.payload.register.toString(),
            qubit: i
          }
        }
      };
      
      // Sending one qubit object per node output
      send(output);
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
