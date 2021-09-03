'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function GroversNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'Grovers';
    const node = this;

    logger.trace(this.id, 'Initialised grovers');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Grovers received input');

      let error = errors.validateGroversInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let script = util.format(snippets.GROVERS, msg.payload);

      shell.start();
      await shell.execute(script)
          .then((data) => {
            data = data.split('\n');
            msg.payload = {
              topMeasurement: data[0].trim(),
              iterationsNum: Number(data[1]),
            };
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed grovers command');
            shell.stop();
          });
    });
  }
  RED.nodes.registerType('grovers', GroversNode);
};
