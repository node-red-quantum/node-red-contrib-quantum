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

const NOT_QUANTUM_NODE =
'This node must be connected to nodes from the "Node-RED Quantum" library only.';

const USE_REGISTER_NODES =
'If "Registers & Bits" was selected in the "Quantum Circuit" node properties, ' +
'please connect "Quantum Register" & "Classical Register" nodes to the "Quantum Circuit" node outputs.';

const SELECT_REGISTER_AND_BITS =
'To use "Quantum Register" & "Classical Register" nodes, ' +
'please select "Registers & Bits" in the "Quantum Circuit" node properties.';

const NOT_QUBIT_OBJECT =
'This node must receive qubits objects as inputs.\n' +
'To generate qubits objects, please make use of the "Quantum Circuit" node.';

const NOT_REGISTER_OBJECT =
'This node must receive register objects as inputs.\n' +
'Please connect it to the outputs of the "Quantum Circuit" node.';

const INVALID_REGISTER_NUMBER =
'Please input the correct number of quantum & classical registers in the "Quantum Circuit" node properties.';

const QUBITS_FROM_DIFFERENT_CIRCUITS =
'Only qubits from the same quantum circuit should be connected to this node.';

const SAME_QUBIT_RECEIVED_TWICE =
'There should be only one instance of each qubit at all times.';

function validateQubitInput(msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    return new Error(NOT_QUANTUM_NODE);
  } else if (keys.includes('register') && typeof msg.payload.register === 'number') {
    return new Error(USE_REGISTER_NODES);
  } else if (!keys.includes('register') || !keys.includes('qubit') || !keys.includes('structure')) {
    return new Error(NOT_QUBIT_OBJECT);
  } else return null;
};

function validateRegisterInput(msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    return new Error(NOT_QUANTUM_NODE);
  } else if (keys.includes('register') && typeof msg.payload.register === 'undefined') {
    return new Error(SELECT_REGISTER_AND_BITS);
  } else if ((keys.includes('register') && typeof msg.payload.register !== 'number') || keys.includes('qubit')) {
    return new Error(NOT_REGISTER_OBJECT);
  } else return null;
};

function validateQubitsFromSameCircuit(qubits) {
  let circuitId = qubits[0].payload.structure.quantumCircuitId;
  let valid = qubits.every((obj) => obj.payload.structure.quantumCircuitId === circuitId);
  if (!valid) return new Error(QUBITS_FROM_DIFFERENT_CIRCUITS);

  valid = true;
  qubits.map((qubit, index) => {
    for (let i = index+1; i < qubits.length; i++) {
      if (i != index &&
      qubit.payload.register == qubits[i].payload.register &&
      qubit.payload.qubit == qubits[i].payload.qubit) {
        valid = false;
      }
    }
  });
  if (!valid) return new Error(SAME_QUBIT_RECEIVED_TWICE);
  else return null;
};

function validateRegisterStrucutre(structureInitialised, strucutreExpected) {
  let count = 0;
  let qreg = 0;
  let creg = 0;
  structureInitialised.map((x) => {
    if (typeof x !== 'undefined') {
      count += 1;
      if (x.registerType === 'quantum') qreg += 1;
      else creg += 1;
    }
  });

  if (qreg > strucutreExpected.qreg || creg > strucutreExpected.creg) {
    return new Error(INVALID_REGISTER_NUMBER), count;
  } else {
    return [null, count];
  }
};

module.exports = {
  NOT_QUANTUM_NODE,
  USE_REGISTER_NODES,
  SELECT_REGISTER_AND_BITS,
  NOT_QUBIT_OBJECT,
  NOT_REGISTER_OBJECT,
  INVALID_REGISTER_NUMBER,
  QUBITS_FROM_DIFFERENT_CIRCUITS,
  SAME_QUBIT_RECEIVED_TWICE,
  validateQubitInput,
  validateRegisterInput,
  validateQubitsFromSameCircuit,
  validateRegisterStrucutre,
};
