const BARRIER = `circuit.barrier(%s)`;

const TOFFOLI = `circuit.cxx(%s, %s, %s)`;

const CNOT = `circuit.cx(%s, %s)`;

module.exports = {
  BARRIER,
  TOFFOLI,
  CNOT,
};
