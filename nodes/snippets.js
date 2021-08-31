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

const IBMQ_SYSTEM_QASM =
`from qiskit.providers.ibmq import least_busy
provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('ibmq_qasm_simulator')
`;

const IBMQ_SYSTEM_DEFAULT =
`from qiskit.providers.ibmq import least_busy
provider = IBMQ.enable_account('%s')
backends = provider.backends(filters=lambda x: (x.configuration().n_qubits >= %s and x.configuration().simulator == %s))
backend_service = least_busy(backends)
`;

const IBMQ_SYSTEM_PREFERRED =
`provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('%s')
`;

const IBMQ_SYSTEM_VERBOSE =
`job = execute(qc, backend=backend_service, shots=%s)
job.result()
`;

const IBMQ_SYSTEM_RESULT =
`job = execute(qc, backend=backend_service, shots=%s)
counts = job.result().get_counts()
print(counts)
`;

const NOT_GATE =
`qc.x(%s)
`;

const CIRCUIT_DIAGRAM =
`qc.draw(output='mpl')
`;

const GROVERS =
`from qiskit import Aer
from qiskit.quantum_info import Statevector
from qiskit.algorithms import Grover, AmplificationProblem

element = '%s'
oracle = Statevector.from_label(element)
problem = AmplificationProblem(oracle=oracle, is_good_state = lambda bitstr: bitstr==element)
backend = Aer.get_backend('qasm_simulator')
grover = Grover(quantum_instance=backend)
result = grover.amplify(problem)
print(result.top_measurement)
iterations = Grover.optimal_num_iterations(num_solutions=1, num_qubits=len(element))
print(iterations)
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

const PORTFOLIO_OPTIMISATION =
`from qiskit import Aer
from qiskit.circuit.library import TwoLocal

from qiskit_finance.applications.optimization import PortfolioOptimization
from qiskit_finance.data_providers import RandomDataProvider

from qiskit_optimization.applications import OptimizationApplication
from qiskit_optimization.converters import QuadraticProgramToQubo

import numpy as np
import datetime

num_assets = %s
seed = %s

stocks = [("TICKERS%s" % i) for i in range(num_assets)]
data = RandomDataProvider(tickers=stocks, 
  start=datetime.datetime(%s), 
  end=datetime.datetime(%s),
  seed=seed)

data.run()
mu = data.get_period_return_mean_vector()
sigma = data.get_period_return_covariance_matrix()

q = 0.5
budget = num_assets // 2
penalty = num_assets
portfolio = PortfolioOptimization(expected_returns=mu, covariances=sigma, risk_factor=q, budget=budget)
qp = portfolio.to_quadratic_program()

def index_to_selection(i, num_assets):
  s = "{0:b}".format(i).rjust(num_assets)
  x = np.array([1 if s[i]=='1' else 0 for i in reversed(range(num_assets))])
  return x

def print_result(result):
  selection = result.x
  value = result.fval
  print("Optimal: Selection {}, value {:.4f}".format(selection, value))
  eigenstate = result.min_eigen_solver_result.eigenstate
  eigenvector = eigenstate if isinstance(eigenstate, np.ndarray) else eigenstate.to_matrix()
  probabilities = np.abs(eigenvector)**2
  i_sorted = reversed(np.argsort(probabilities))
  print("\\n-----------------------Full Result-----------------------")
  print("selection\\tvalue\\t\\tprobability")
  print("---------------------------------------------------------")
  for i in i_sorted:
    x = index_to_selection(i, num_assets)
    value = QuadraticProgramToQubo().convert(qp).objective.evaluate(x)
    probability = probabilities[i]
    print("%10s\\t%.4f\\t\\t%.4f" %(x, value, probability))

`;

const NME =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.algorithms import NumPyMinimumEigensolver
exact_mes = NumPyMinimumEigensolver()
exact_eigensolver = MinimumEigenOptimizer(exact_mes)
result = exact_eigensolver.solve(qp)
print_result(result)
`;

const VQE =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import algorithm_globals
from qiskit.utils import QuantumInstance
from qiskit.algorithms import VQE
from qiskit.algorithms.optimizers import COBYLA
algorithm_globals.random_seed = 1234
backend = Aer.get_backend("statevector_simulator")

cobyla = COBYLA()
cobyla.set_options(maxiter=500)
ry = TwoLocal(num_assets, "ry", "cz", reps=3, entanglement="full")
quantum_instance = QuantumInstance(backend=backend, seed_simulator=seed, seed_transpiler=seed)
vqe_mes = VQE(ry, optimizer=cobyla, quantum_instance=quantum_instance)
vqe = MinimumEigenOptimizer(vqe_mes)

result = vqe.solve(qp)
print_result(result)
`;

const QAOA =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import algorithm_globals
from qiskit.utils import QuantumInstance
from qiskit.algorithms import QAOA
from qiskit.algorithms.optimizers import COBYLA
algorithm_globals.random_seed = 1234
backend = Aer.get_backend("statevector_simulator")

cobyla = COBYLA()
cobyla.set_options(maxiter=250)
quantum_instance = QuantumInstance(backend=backend, seed_simulator=seed, seed_transpiler=seed)
qaoa_mes = QAOA(optimizer=cobyla, reps=3, quantum_instance=quantum_instance)
qaoa = MinimumEigenOptimizer(qaoa_mes)

result = qaoa.solve(qp)
print_result(result)
`;

const INITIALIZE =
`from qiskit.quantum_info import Statevector
qc.initialize(Statevector.from_label('%s').data, %s)
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
  IBMQ_SYSTEM_QASM,
  IBMQ_SYSTEM_DEFAULT,
  IBMQ_SYSTEM_PREFERRED,
  IBMQ_SYSTEM_VERBOSE,
  IBMQ_SYSTEM_RESULT,
  GROVERS,
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
  PORTFOLIO_OPTIMISATION,
  NME,
  VQE,
  QAOA,
  INITIALIZE,
  SHORS,
};
