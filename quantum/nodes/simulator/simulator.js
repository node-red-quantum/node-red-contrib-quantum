'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const {errors} = require('../../errors');

module.exports = function(RED) {
  const validateInput = (node, msg) => {
    if (msg.topic !== 'Quantum Circuit') {
      node.error(errors.NOT_QUANTUM_CIRCUIT, msg);
    }
  }
  function SimulatorNode(config) {
    RED.nodes.createNode(this, config);
    this.shots = config.shots || 1;
    const node = this;
    const flowContext = this.context().flow;

    this.on('input', async function(msg, send, done) {
      validateInput(node, msg);

      const qubit = msg.payload.qubit.toString();
      flowContext.set('quantumCircuit[' + qubit + ']', qubit);
      let qubitsArray = flowContext.get('quantumCircuit');
      let arrivedCount = qubitsArray.filter((item) => typeof(item) !== 'undefined').length;

      if (arrivedCount == qubitsArray.length) {
        const params = node.shots;
        const simulatorScript = util.format(snippets.SIMULATOR, params);
        await shell.execute(simulatorScript, (err,data) => {
          if (err) {
            node.error(err, msg);
          }
          else{
            msg.payload = data;
            send(msg);
          }
        });
        if (done) {
          done();
        }
      }
    });
  }

  RED.nodes.registerType('simulator', SimulatorNode);
};
