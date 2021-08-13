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

const CIRCUIT_BUFFER =
`import matplotlib.pyplot as plt
import base64
import io
qc.draw(output='mpl')
buffer = io.BytesIO()
plt.savefig(buffer,  format='png')
buffer.seek(0)
b64_string = base64.b64encode(buffer.read())
print(b64_string)
`;

const GROVERS_ALGO =
`from qiskit import QuantumCircuit
from qiskit import Aer
from qiskit.utils import QuantumInstance
from qiskit.quantum_info import Statevector
from qiskit.algorithms import Grover, AmplificationProblem

element = '%s'
oracle = Statevector.from_label(element)
problem = AmplificationProblem(oracle=oracle, is_good_state = lambda bitstr: bitstr==element)
backend = Aer.get_backend('qasm_simulator')
grover = Grover(quantum_instance=backend)
result = grover.amplify(problem)
print('Success!' if result.oracle_evaluation else 'Failure!')
print('Top measurement:', result.top_measurement)
iterations = Grover.optimal_num_iterations(num_solutions=1, num_qubits=len(element))
print('iterations = %i'%iterations)
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

const CU_GATE =
`qc.cu(%s, %s, %s, %s, %s, %s)
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
  IBMQ_SYSTEM_DEFAULT,
  IBMQ_SYSTEM_PREFERRED,
  IBMQ_SYSTEM_VERBOSE,
  IBMQ_SYSTEM_RESULT,
  GROVERS_ALGO,
  NOT_GATE,
  CIRCUIT_BUFFER,
  RESET,
  PHASE_GATE,
  ROTATION_GATE,
  IDENTITY,
  SWAP,
  UNITARY_GATE,
  CU_GATE,
};
