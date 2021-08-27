'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

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

      await shell.start();

      await shell.execute(script, (err, data) => {
        if (err) {
          done(err);
        } else {
          
          msg.payload = data;
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }

  RED.nodes.registerType('portfolio-optimisation', PortfolioOptimisationNode);
};
