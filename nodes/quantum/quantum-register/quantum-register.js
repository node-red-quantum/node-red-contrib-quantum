'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const stateManager = require('../../state').StateManager;
const errors = require('../../errors');
const logger = require('../../logger');

module.exports = function(RED) {
  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.outputs = parseInt(config.outputs);
    const node = this;

    logger.trace(this.id, 'Initialised quantum register');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Quantum register received input');
      const state = stateManager.getState(msg.circuitId);
      let script = '';
      let output = new Array(node.outputs);

      // Validate the node input msg: check for register object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateRegisterInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let shouldInitCircuit = msg.shouldInitCircuit;
      let registerArr = state.get('registers');
      let circuitReadyEvent = state.get('quantumCircuitReadyEvent');
      let circuitReady = state.get('isCircuitReady');

      // Setting node.name to "r0","r1"... if the user did not input a name
      if (node.name == '') {
        node.name = 'r' + msg.payload.register.toString();
      }

      // Add arguments to quantum register code
      script += util.format(snippets.QUANTUM_REGISTER,
          msg.payload.register.toString(),
          node.outputs.toString() + ', "' + node.name + '"',
      );

      registerArr.push(`qr${msg.payload.register}`);

      // Creating an array of messages to be sent
      // Each message represents a different qubit
      for (let i = 0; i < node.outputs; i++) {
        output[i] = {
          topic: 'Quantum Circuit',
          payload: {
            structure: msg.payload.structure,
            register: node.name,
            registerVar: 'qr' + msg.payload.register.toString(),
            totalQubits: node.outputs,
            qubit: i,
          },
        };
        if (msg.req && msg.res) {
          output[i].req = msg.req;
          output[i].res = msg.res;
        }
      }

      if (shouldInitCircuit) {
        logger.trace(node.id, 'Should execute quantum circuit init command');
        script += util.format(snippets.QUANTUM_CIRCUIT, registerArr.join(','));
      }

      // Run the script in the python shell, and if no error occurs
      // then send one qubit object per node output
      await shell.execute(script, (err) => {
        logger.trace(node.id, 'Executed quantum register command');
        if (err) {
          error = err;
        } else {
          error = null;
        }
      });

      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      if (shouldInitCircuit) {
        logger.trace(node.id, 'Quantum register emitted circuit ready event');
        circuitReadyEvent.emit('circuitReady', null);
        state.del('registers');
      } else {
        // wait for quantum circuit to be initialised
        logger.trace(node.id, 'Quantum register waiting for circuit to be ready');
        await circuitReady();
      }

      let binaryString = state.get('binaryString');
      if (binaryString) {
        let initScript = util.format(snippets.INITIALIZE, binaryString, `qc.qubits`);
        state.del('binaryString');

        await shell.execute(initScript, (err) => {
          logger.trace(node.id, 'Executed quantum register initialise command');
          if (err) {
            error = err;
          } else {
            error = null;
          }
        });

        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }
      }

      send(output);
      done();
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
