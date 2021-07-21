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
  };
  function MeasurementNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.selectedBit = config.selectedBit;
    this.selectedRegVarName = config.selectedRegVarName;
    this.classicalRegistersOrBits = '';

    const node = this;
    this.on('input', async function(msg, send, done) {
      validateInput(node, msg);
      const params = (!node.selectedRegVarName) ? `${msg.payload.qubit}, ${node.selectedBit}`:
        `${msg.payload.registerVar}[${msg.payload.qubit}], ` +
        `${node.selectedRegVarName}[${node.selectedBit}]`;

      const measureScript = util.format(snippets.MEASUREMENT, params);
      await shell.execute(measureScript, (err) => {
        if (err) {
          node.error(err, msg);
        }
      });
      send(msg);
      if (done) {
        done();
      }
    });
  }

  RED.nodes.registerType('measurement', MeasurementNode);
};
