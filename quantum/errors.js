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

function validateQubitInput(node, msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    node.error(
        'This node must be connected to nodes from the "Node-RED Quantum" library only.',
    );
  } else if (keys.includes('register') && typeof msg.payload.register === 'number') {
    node.error(
        'If "Registers & Bits" was selected in the "Quantum Circuit" node properties, ' +
        'please connect "Quantum Register" & "Classical Register" nodes to the "Quantum Circuit" node outputs.',
    );
  } else if (!keys.includes('register') || !keys.includes('qubit') || !keys.includes('structure')) {
    node.error(
        'This node must receive qubits objects as inputs.\n' +
        'To generate qubits objects, please make use of the "Quantum Circuit" node.',
    );
  }
};

function validateRegisterInput(node, msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    node.error(
        'This node must be connected to nodes from the "Node-RED Quantum" library only.',
    );
  } else if (keys.includes('register') && typeof msg.payload.register === 'undefined') {
    node.error(
        'To use "Quantum Register" & "Classical Register" nodes, ' +
        'please select "Registers & Bits" in the "Quantum Circuit" node properties.',
    );
  } else if ((keys.includes('register') && typeof msg.payload.register !== 'number') || keys.includes('qubit')) {
    node.error(
        'This node must receive register objects as inputs.\n' +
        'Please connect it to the outputs of the "Quantum Circuit" node.',
    );
  }
};

function validateQubitsFromSameCircuit(node, qubits) {
  let circuitId = qubits[0].payload.structure.quantumCircuitId;
  let valid = qubits.every((obj) => obj.payload.structure.quantumCircuitId === circuitId);
  if (!valid) node.error('Only qubits from the same quantum circuit should be connected to this node.');
};

const INVALID_REGISTER_NUMBER =
'Please input the correct number of quantum & classical registers in the "Quantum Circuit" node properties.';

const QUBITS_FROM_DIFFERENT_CIRCUITS =
'Only qubits from the same quantum circuit should be connected to this node.';

module.exports = {
  validateQubitInput,
  validateRegisterInput,
  validateQubitsFromSameCircuit,
  INVALID_REGISTER_NUMBER,
  QUBITS_FROM_DIFFERENT_CIRCUITS,
};
