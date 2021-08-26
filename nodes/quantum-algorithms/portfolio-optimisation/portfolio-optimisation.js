'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
// https://github.com/Qiskit/qiskit-aqua/blob/main/README.md#migration-guide
// https://qiskit.org/documentation/optimization/apidocs/qiskit_optimization.applications.html#module-qiskit_optimization.applications
// require qiskit-finance, qiskit-optimization
module.exports = function(RED) {
  function PortfolioOptimisationNode(config) { // Change the name
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
      // Define the node's Qiskit script in `snippets.js`
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

      console.log(script);

      await shell.start();

      // Run the Qiskit script in the python shell
      // If no error occur, send the qubit object as node output
      await shell.execute(script, (err, data) => {
        if (err) {
          done(err);
        } else {
          // Store the node's output in `msg.payload` and send it
          msg.payload = data;
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }

  RED.nodes.registerType('portfolio-optimisation', PortfolioOptimisationNode); // Change the name
};
