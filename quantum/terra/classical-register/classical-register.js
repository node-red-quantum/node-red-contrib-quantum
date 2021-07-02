module.exports = function(RED) {
  'use strict';

  const newProcess = require('../../python-shell');

  function ClassicalRegisterNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    this.on('input', function(msg) {
      newProcess.readError(function(err) {
        if (err != null) node.error(err);
        return null;
      });

      newProcess.readOutput(function(data) {
        msg.payload = data;
        node.send(msg);
      });

      newProcess.writeInput('job = simulator.run(compiled_circuit, shots=1000)');
      newProcess.writeInput('result = job.result()');
      newProcess.writeInput('counts = result.get_counts(circuit)');
      newProcess.writeInput('print("Total count for 00 and 11 are:", counts)');
    });
  }

  RED.nodes.registerType('classical-register', ClassicalRegisterNode);
};
