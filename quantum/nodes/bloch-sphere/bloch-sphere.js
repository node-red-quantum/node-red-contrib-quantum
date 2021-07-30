'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED){
  function blochSphereNode(config){
    RED.nodes.createNode(this, config);
    this.name = config.name;
    const node = this;

    this.on('input', async function(msg, send, done) {
      // Throw Error if:
      // - The user connects it to a node that is not from the quantum library
      if (msg.topic !== 'Quantum Circuit') {
        throw new Error(
            'The Not Gate node must be connected to nodes from the quantum library only.',
        );
      }
      //more codes here
      console.log(msg)
      console.log(`bloch-sphere: ${msg}`);
      let script = snippets.BLOCH_SPHERE;

      // Run the script in the python shell
      await shell.execute(script, (err, data) => {
        if (err) node.error(err);
        node.warn(data);
        console.log(data);
        
      });
      send(msg);
    });

  }
  RED.nodes.registerType('bloch-sphere', blochSphereNode);

};
