module.exports = function(RED) {
  'use strict';

  const newProcess = require('../../python-shell');

  function QuantumCircuitNode(config) {
    RED.nodes.createNode(this, config);
    this.qubits = config.qubits;
    this.cbits = config.cbits;
    const node = this;

    this.on('input', function(msg, send, done) {
      newProcess.readError(function(err) {
        if (err != null) node.error(err);
        return null;
      });

      newProcess.readOutput(function(data) {
        msg.payload = data;
        node.send(msg);
      });

      newProcess.writeInput('from qiskit import QuantumCircuit, transpile');
      newProcess.writeInput('from qiskit.providers.aer import QasmSimulator');
      newProcess.writeInput('from qiskit.visualization import plot_histogram');
      newProcess.writeInput('simulator = QasmSimulator()');
      newProcess.writeInput('circuit = QuantumCircuit(2, 2)');
      newProcess.writeInput('_ = circuit.h(0)');
      newProcess.writeInput('_ = circuit.cx(0, 1)');
      newProcess.writeInput('_ = circuit.measure([0,1], [0,1])');
      newProcess.writeInput('compiled_circuit = transpile(circuit, simulator)');
      newProcess.writeInput('print("Done 1")');
    });
  }

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
