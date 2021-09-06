'use strict';

const util = require('util');
const snippets = require('../../snippets');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function PortfolioOptimisationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.solverMethod = config.solverMethod || 'none';
    this.seeds = config.seeds || 123;
    this.assets = config.assets || 4;
    this.startDate = config.start;
    this.endDate = config.end;
    const node = this;

    this.on('input', async function(msg, send, done) {
      let startDateStr = node.startDate.toString().replace(/-0+/g, ',').replace(/-/g, ',');
      let endDateStr = node.endDate.toString().replace(/-0+/g, ',').replace(/-/g, ',');
      let script = util.format(
          snippets.PORTFOLIO_OPTIMISATION, node.assets, node.seeds,
          '%s',
          startDateStr,
          endDateStr,
      );

      if (node.solverMethod == 'vqe') {
        script += snippets.VQE;
      } else if (node.solverMethod == 'qaoa') {
        script += snippets.QAOA;
      } else {
        script += snippets.NME;
      }

      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Running algorithm...',
      });

      shell.start();
      await shell.execute(script)
          .then((data) => {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'Optimisation completed!',
            });
            msg.payload = data;
            send(msg);
            done();
          })
          .catch((err) => {
            node.status({
              fill: 'red',
              shape: 'dot',
              text: 'Job failed!',
            });
            logger.error(node.id, err);
            done(err);
          })
          .finally(() => {
            logger.trace(node.id, 'Executed portfolio optimisation command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('portfolio-optimisation', PortfolioOptimisationNode);
};
