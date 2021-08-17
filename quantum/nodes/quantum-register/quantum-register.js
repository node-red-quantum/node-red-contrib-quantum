'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const stateManager = require('../../state').StateManager;
const errors = require('../../errors');

module.exports = function(RED) {
  function QuantumRegisterNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    this.name = config.name.trim().toLowerCase().replace(/ /g, '_');
    this.outputs = parseInt(config.outputs);
    const node = this;

    this.on('input', async function(msg, send, done) {
      const state = stateManager.getState(msg.circuitId);
      let script = '';
      let output = new Array(node.outputs);

      // Validate the node input msg: check for register object.
      // Return corresponding errors or null if no errors.
      // Stop the node execution upon an error
      let error = errors.validateRegisterInput(msg);
      if (error) {
        done(error);
        return;
      }

      // Setting node.name to "r0","r1"... if the user did not input a name
      if (node.name == '') {
        node.name = 'r' + msg.payload.register.toString();
      }

      // Add arguments to quantum register code
      script += util.format(snippets.QUANTUM_REGISTER,
          msg.payload.register.toString(),
          node.outputs.toString() + ', "' + node.name + '"',
      );

      // Completing the 'quantumCircuit' flow context array
      let register = {
        registerType: 'quantum',
        registerName: node.name,
        registerVar: 'qr' + msg.payload.register.toString(),
      };
      state.setRuntime('quantumCircuit[' + msg.payload.register.toString() + ']', register);

      // get quantum circuit config and circuit ready event from flow context
      let quantumCircuitConfig = state.get('quantumCircuitConfig');
      let circuitReady = state.get('isCircuitReady');
      quantumCircuitConfig[node.name] = register;

      // If the quantum circuit has not yet been initialised by another register
      if (typeof(state.get('quantumCircuit')) !== undefined) {
        let structure = state.get('quantumCircuit');

        // Validating the registers' structure according to the user input in 'Quantum Circuit'
        // And counting how many registers were initialised so far.
        let [error, count] = errors.validateRegisterStrucutre(structure, msg.payload.structure);
        if (error) {
          done(error);
          return;
        }

        // If all register initialised & the circuit has not been initialised by another register:
        // Initialise the quantum circuit
        if (count == structure.length && typeof(state.get('quantumCircuit')) !== undefined) {
          // Delete the 'quantumCircuit' variable, not used anymore
          state.del('quantumCircuit');

          // Add arguments to quantum circuit code
          let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, '%s,'.repeat(count));

          structure.map((register) => {
            circuitScript = util.format(circuitScript, register.registerVar);
          });

          script += circuitScript;
        }
      }

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
      }

      // Run the script in the python shell, and if no error occurs
      // then send one qubit object per node output
      await shell.execute(script, (err) => {
        if (err) done(err);
      });
      // wait for quantum circuit to be initialised
      await circuitReady();
      send(output);
      done();
    });
  }

  RED.nodes.registerType('quantum-register', QuantumRegisterNode);
};
