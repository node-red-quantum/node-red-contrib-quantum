'use strict';

/*
 * Node-RED nodes error handling functions should be defined here for homogeneity and reuse.
 *
 * Remember to export these validation functions at the end of the file.
 *
 * To use values from JavaScript code within an error message, insert a '%s' where you want
 * to place the values. You can then use the util.format() function to replace them with
 * the values at runtime.
 */

function validateQubitInput(msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    throw new Error(
        'This node must be connected to nodes from the "Node-RED Quantum" library only.',
    );
  } else if (keys.includes('register') && typeof msg.payload.register === 'number') {
    throw new Error(
        'If "Registers & Bits" was selected in the "Quantum Circuit" node properties, ' +
        'please connect "Quantum Register" & "Classical Register" nodes to the "Quantum Circuit" node outputs.',
    );
  } else if (!keys.includes('register') || !keys.includes('qubit') || !keys.includes('structure')) {
    throw new Error(
        'This node must receive qubits objects as inputs.\n' +
        'To generate qubits objects, please make use of the "Quantum Circuit" node.',
    );
  }
};

function validateRegisterInput(msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    throw new Error(
        'This node must be connected to nodes from the "Node-RED Quantum" library only.',
    );
  } else if (keys.includes('register') && typeof msg.payload.register === 'undefined') {
    throw new Error(
        'To use "Quantum Register" & "Classical Register" nodes, ' +
        'please select "Registers & Bits" in the "Quantum Circuit" node properties.',
    );
  } else if ((keys.includes('register') && typeof msg.payload.register !== 'number') || keys.includes('qubit')) {
    throw new Error(
        'This node must be connected to the outputs of the "Quantum Circuit" node.',
    );
  }
};

module.exports = {
  validateQubitInput,
  validateRegisterInput,
};
