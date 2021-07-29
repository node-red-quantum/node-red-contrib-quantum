'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function MeasureNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.selectedBit = config.selectedBit;
    this.selectedRegVarName = config.selectedRegVarName;
    this.classicalRegistersOrBits = '';
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        return;
      }

      const params = (!node.selectedRegVarName) ? `${msg.payload.qubit}, ${node.selectedBit}`:
        `${msg.payload.registerVar}[${msg.payload.qubit}], ` +
        `${node.selectedRegVarName}[${node.selectedBit}]`;

      script += util.format(snippets.MEASURE, params);

      await shell.execute(script, (err) => {
        if (err) done(err);
        else {
          send(msg);

          const status = (!node.selectedRegVarName) ? `Result: cbit ${node.selectedBit}`:
          `Result: register ${node.selectedRegVarName} / cbit ${node.selectedBit}`;
          node.status({
            fill: 'grey',
            shape: 'dot',
            text: status,
          });

          done();
        };
      });
    });
  }

  RED.nodes.registerType('measure', MeasureNode);
};
