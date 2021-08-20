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
const IMPORTS =
`from math import pi
from qiskit import *
`;

const QUANTUM_CIRCUIT =
`qc = QuantumCircuit(%s)
`;

const CLASSICAL_REGISTER =
`cr%s = ClassicalRegister(%s)
`;

const QUANTUM_REGISTER =
`qr%s = QuantumRegister(%s)
`;

const TOFFOLI_GATE =
`qc.toffoli(%s, %s, %s)
`;

const CNOT_GATE =
`qc.cx(%s, %s)
`;

const BARRIER =
`qc.barrier(%s)
`;

const HADAMARD_GATE =
`qc.h(%s)
`;

const MEASURE =
`qc.measure(%s)
`;

const LOCAL_SIMULATOR =
`simulator = Aer.get_backend('qasm_simulator')
result = execute(qc, backend = simulator, shots = %s).result()
counts = result.get_counts()
print(counts)
`;

const IBMQ_SYSTEM_DEFAULT =
`from qiskit.providers.ibmq import least_busy
provider = IBMQ.enable_account('%s')
backends = provider.backends(filters=lambda x: x.configuration().n_qubits >= %s)
backend_service = least_busy(backends)
`;

const IBMQ_SYSTEM_PREFERRED =
`provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('%s')
`;

const IBMQ_SYSTEM_VERBOSE =
`job = execute(qc, backend=backend_service)
job.result()
`;

const IBMQ_SYSTEM_RESULT =
`job = execute(qc, backend=backend_service)
counts = job.result().get_counts()
print(counts)
`;

const NOT_GATE =
`qc.x(%s)
`;

const CIRCUIT_DIAGRAM =
`qc.draw(output='mpl')
`;

const RESET =
`qc.reset(%s)
`;

const PHASE_GATE =
`qc.p(%s, %s)
`;

const ROTATION_GATE =
`qc.r%s(%s, %s)
`;

const UNITARY_GATE =
`qc.u(%s, %s, %s, %s)
`;

const IDENTITY =
`qc.id(%s)
`;

const SWAP =
`qc.swap(%s, %s)
`;

const MULTI_CONTROLLED_U_GATE =
`from qiskit.circuit.library import UGate
qc.append(UGate(%s, %s, %s).control(%s), %s)
`;

const BLOCH_SPHERE =
`from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector
state = Statevector.from_instruction(qc)
plot_bloch_multivector(state)
`;

const CU_GATE =
`qc.cu(%s, %s, %s, %s, %s, %s)
`;

const ENCODE_IMAGE =
`import matplotlib.pyplot as plt
import base64
import io
buffer = io.BytesIO()
plt.savefig(buffer,  format='png')
buffer.seek(0)
b64_str = base64.b64encode(buffer.read())
print(b64_str)
buffer.close()
`;

const SHORS =
`from qiskit import Aer
from qiskit.algorithms import Shor

backend = Aer.get_backend('qasm_simulator')
shor = Shor(quantum_instance=backend)
result = shor.factor(%s)
factors = [] if result.factors == [] else result.factors[0]
print(factors)
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
  MULTI_CONTROLLED_U_GATE,
  IBMQ_SYSTEM_DEFAULT,
  IBMQ_SYSTEM_PREFERRED,
  IBMQ_SYSTEM_VERBOSE,
  IBMQ_SYSTEM_RESULT,
  NOT_GATE,
  CIRCUIT_DIAGRAM,
  RESET,
  PHASE_GATE,
  ROTATION_GATE,
  IDENTITY,
  SWAP,
  UNITARY_GATE,
  BLOCH_SPHERE,
  CU_GATE,
  ENCODE_IMAGE,
  SHORS,
};
