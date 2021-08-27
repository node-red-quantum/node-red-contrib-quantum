'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonShellClass} = require('../../python');
const shell = new PythonShellClass();

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

      const script = util.format(snippets.GROVERS, msg.payload);
      await shell.start();
      await shell.execute(script, (err, data) => {
        logger.trace(node.id, 'Executed grovers command');
        if (err) {
          logger.error(node.id, err);
          done(err);
        } else {
          data = data.split('\n');
          msg.payload = {
            topMeasurement: data[0],
            iterationsNum: Number(data[1]),
          };
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }
  RED.nodes.registerType('grovers', GroversNode);
};
