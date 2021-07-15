'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {

  function NotGateNode(config){
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.targetPosition = config.targetPosition;
    const node = this;

    node.on("input", (msg, send, done) => {
      //Thorw error if:
      // - The user connects it to a node that is not from the quantum library
      // - The user does not input a qubit object in the node
      // - the user chooses to use registers but does not initiate them
      if (msg.topic !== 'Quantum Circuit'){
        throw new Error(
          'The Not Gate node must be connected to nodes from the quantum library only.'
        ); 
        
        
      } else if (
        typeof msg.payload.register === 'undefined' &&
        typeof msg.payload.qubit === 'undefined'
      ){

        throw new Error(
          'The Node Gate node must be receive qubits objects as inputs.\n' + 
          'Please use "Quantum Circut" and "Quantum Register" node to generate qubits objects.'

        );

      } else if (
        typeof msg.payload,qubit === 'undefined'

      ){
        'If "Registers & Bits" was selected in the "Quantum Circuit" node, please make use of register nodes.'

      }

      node.qubits.push(msg)

      //
      if (node.qubits.length == 1){
        let target = node.qubits[0];
        node.qubits.map((msg) => {
          if (typeof msg.payload.register === 'undefined'){
            snippets = util.format(
              snippets.NOT_GATE,
              target.qubit.toString()

            );

          } else {
            snippets.NOT_GATE,
            target.registerVar + '['+target.qubit.toString+']';

          }
        });
      }

      // Run the script in the python shell
      await shell.execute(notScript, (err) => {
        if (err) node.error(err);
      });

      send(node.qubits);
    })
  }
  RED.nodes.registerType('not-gate', NotGateNode);
};
