module.exports = function(RED) {
  'use strict';

  function QuantumCircuitNode(config) {

    // Creating node with properties and context 
    RED.nodes.createNode(this, config);
    this.outputs = config.outputs;
    const globalContext = this.context().global;
    const node = this;

    this.on('input', function(msg, send, done) {

      // Storing import script to the 'script' global variable
      const qiskitScript = (
        "import numpy as np \n" +
        "import qiskit \n" +
        "from qiskit import * \n"
      );
      globalContext.set("script", qiskitScript);

      // Creating an empty 'structure' global array
      // This variable represents the quantum circuit structure
      const structure = new Array(this.outputs);
      globalContext.set("structure", structure);
      
      // Creating an array of messages to be sent
      // Each message represents a dfifferent register
      var i = 0;
      var output = new Array(this.outputs);
      for (i=0; i<this.outputs; i++){
        output[i] = {
          topic: "Quantum Circuit",
          payload: {
            register: i
          }
        }
      };

      // Sending one register object per node output
      send(output);
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};