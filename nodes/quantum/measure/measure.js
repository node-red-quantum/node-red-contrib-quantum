'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function MeasureNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.selectedBit = config.selectedBit;
    this.selectedRegVarName = config.selectedRegVarName;
    this.classicalRegistersOrBits = '';
    const node = this;

    logger.trace(this.id, 'Initialised measure');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Measure received input');
      let script = '';

      // Validate the node input msg: check for qubit object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateQubitInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      const params = (!node.selectedRegVarName) ? `${msg.payload.qubit}, ${node.selectedBit}`:
        `${msg.payload.registerVar}[${msg.payload.qubit}], ` +
        `${node.selectedRegVarName}[${node.selectedBit}]`;

      script += util.format(snippets.MEASURE, params);
      await shell.execute(script)
          .then(() => {
            const status = (!node.selectedRegVarName) ? `Result: cbit ${node.selectedBit}`:
            `Result: register ${node.selectedRegVarName.substring(3)} / cbit ${node.selectedBit}`;
            node.status({
              fill: 'grey',
              shape: 'dot',
              text: status,
            });
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed measure command');
          });
    });
  }

  RED.nodes.registerType('measure', MeasureNode);
};
