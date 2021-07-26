'use strict';

module.exports = function(RED) {
  function QubitNode(config) {
    // Creating node with properties
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    this.on('input', function(msg, send, done) {
      // Throw a connection error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - The user chooses to use registers but does not initiate them
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'Qubit nodes must be connected to nodes from the quantum library only.',
        );
      } else if (typeof(msg.payload.register) === 'undefined' && typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'Qubit nodes must receive qubits objects as inputs.\n' +
            'Please use "Quantum Circuit" & "Quantum Register" nodes to generate qubits objects.',
        );
      } else if (typeof(msg.payload.qubit) === 'undefined') {
        throw new Error(
            'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.',
        );
      }

      // Using node status to inform the user of which qubit is being transmitted
      if (typeof(msg.payload.register) === 'undefined') {
        node.status({
          fill: 'grey',
          shape: 'dot',
          text: 'Qubit ' + msg.payload.qubit.toString(),
        });
      } else {
        node.status({
          fill: 'grey',
          shape: 'dot',
          text: 'Register ' + msg.payload.register + ' / Qubit ' + msg.payload.qubit.toString(),
        });
      }

      // Simply return the msg received without any operations
      send(msg);
    });
  }

  RED.nodes.registerType('qubit', QubitNode);
};
