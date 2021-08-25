'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');
//https://github.com/Qiskit/qiskit-aqua/blob/main/README.md#migration-guide
//https://qiskit.org/documentation/optimization/apidocs/qiskit_optimization.applications.html#module-qiskit_optimization.applications
//require qiskit-finance, qiskit-optimization
module.exports = function(RED) {
  function PortfolioOptimisationNode(config) { // Change the name
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.solverMethod = config.solverMethod;
    const node = this;

    this.on('input', async function(msg, send, done) {
      
      // Define the node's Qiskit script in `snippets.js`
      let script = snippets.PORTFOLIO_OPTIMISATION;
      console.log(node.solverMethod);

      if (node.solverMethod == 'vqe'){
        script += snippets.QVE;

      } else if (node.solverMethod == 'qaoa'){
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
          msg.payload = '';
          send(msg);
          done();
        }
      });
      shell.stop();
    });
  }

  RED.nodes.registerType('portfolio-optimisation', PortfolioOptimisationNode); // Change the name
};
