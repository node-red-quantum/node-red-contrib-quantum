'use strict';

/*
 * Snippets must be constants, and constants must capitalised with underscores.
 *
 * Remember to export snippets at the end of the file.
 *
 * To use values from JavaScript code within a snippet, insert a '%s' where you want
 * to place the values. You can then use the util.format() function to replace them with
 * the values at runtime.
 */

// Probably shouldn't use wildcard import here for efficiency but whatever will
// worry about it later.
const IMPORTS = `from math import pi
from qiskit import *
`;

const QUANTUM_CIRCUIT = `qc = QuantumCircuit(%s)
`;

const CLASSICAL_REGISTER = `cr%s = ClassicalRegister(%s)
`;

const QUANTUM_REGISTER = `qr%s = QuantumRegister(%s)
`;

const TOFFOLI_GATE = `qc.toffoli(%s, %s, %s)
`;

const CNOT_GATE = `qc.cx(%s, %s)
`;

const BARRIER = `qc.barrier(%s)
`;

const HADAMARD_GATE = `qc.h(%s)
`;

const MEASURE = `qc.measure(%s)
`;

const LOCAL_SIMULATOR = `simulator = Aer.get_backend('qasm_simulator')
result = execute(qc, backend = simulator, shots = %s).result()
counts = result.get_counts()
print(counts)
`;

const IBMQ_SYSTEM_VERBOSE = `provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('%s')
job = execute(qc, backend=backend_service)
job.result()`;

const IBMQ_SYSTEM_RESULT = `provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('%s')
job = execute(qc, backend=backend_service)
counts = job.result().get_counts()
print(counts)`;

const NOT_GATE = `qc.x(%s)
`;

const RESET = `qc.reset(%s)
`;

const PHASE_GATE = `qc.p(%s, %s)
`;

const ROTATION_GATE = `qc.r%s(%s, %s)
`;

const UNITARY_GATE = `qc.u(%s, %s, %s, %s)
`;

const IDENTITY = `qc.id(%s)
`;

const SWAP = `qc.swap(%s, %s)
`;

module.exports = {
  IMPORTS,
  QUANTUM_CIRCUIT,
  CLASSICAL_REGISTER,
  QUANTUM_REGISTER,
  TOFFOLI_GATE,
  CNOT_GATE,
  BARRIER,
  HADAMARD_GATE,
  MEASURE,
  LOCAL_SIMULATOR,
  IBMQ_SYSTEM_VERBOSE,
  IBMQ_SYSTEM_RESULT,
  NOT_GATE,
  RESET,
  PHASE_GATE,
  ROTATION_GATE,
  IDENTITY,
  SWAP,
  UNITARY_GATE,
};
