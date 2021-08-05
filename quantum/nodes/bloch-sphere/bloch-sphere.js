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
            'The Bloch Sphere Diagram node must be connected to nodes from the quantum library only.',
        );
      }
      //more codes here
      console.log(msg)
      console.log(`bloch-sphere: ${msg}`);
       
      let script = `
      state = Statevector.from_instruction(qc)
      blochResult = plot_bloch_multivector(state)

      ioByte = io.BytesIO()
      blochResult.savefig(ioByte, format = 'jpg')
      ioByte.seek(0)
      b64_str = base64.b64encode(ioByte.read())
      print(b64_str)
      ioByte.close()
      
      `;
            
      // Run the script in the python shell
      await shell.execute(script, (err, data) => {
        if (err){

          node.error(err);

        }else{

          msg.payload = data.split('\'')[1];
          msg.encoding = 'base64';
          send(msg);
          done();

        }
        console.log("done\nmsg:" + msg);
      });
    });

  }
  RED.nodes.registerType('bloch-sphere', blochSphereNode);

};
