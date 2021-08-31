'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const stateManager = require('../../state').StateManager;
const logger = require('../../logger');

const EventEmitter = require('events');
const quantumCircuitReady = new EventEmitter();

module.exports = function(RED) {
  let quantumCircuitNode = {};
  let classicalRegisters = [];

  function QuantumCircuitNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    quantumCircuitNode = this;
    this.name = config.name;
    this.structure = config.structure;
    this.qbitsreg = parseInt(config.qbitsreg);
    this.cbitsreg = parseInt(config.cbitsreg);
    this.outputs = parseInt(config.outputs);
    const state = stateManager.newState(this.id);
    const node = this;

    state.setPersistent('quantumCircuitReadyEvent', quantumCircuitReady);

    state.setPersistent('isCircuitReady', () => {
      let event = state.get('quantumCircuitReadyEvent');
      return new Promise((res, rej) => {
        event.once('circuitReady', () => {
          res();
        });
      });
    });

    // create an empty array in state to store register names
    state.setPersistent('registers', []);

    logger.trace(this.id, 'Initialised quantum circuit');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'Quantum circuit received input');
      state.resetRuntime();
      let script = '';
      script += snippets.IMPORTS;

      let output = new Array(node.outputs);

      // Check if the input msg contains binar string definition
      if (msg.payload.binaryString) {
        // Check the length of the binary string
        let binaryString = msg.payload.binaryString;
        if (binaryString.length != node.outputs) {
          done(new Error(`Binary string length mismatch. Expect: ${node.outputs}, actual: ${binaryString.length}`));
          return;
        } else if (!/^[01]+$/.test(binaryString)) { // Use regular expression to check if it's a valid binary string
          done(new Error(`Input should be a binary string`));
          return;
        }
        // Set temporary flow context
        state.setRuntime('binaryString', binaryString);
      }

      // Creating a temporary 'quantumCircuitArray' flow context array
      // This variable represents the quantum circuit structure
      let quantumCircuitArray = new Array(node.outputs);
      state.setRuntime('quantumCircuit', quantumCircuitArray);
      // If the user wants to use registers
      if (node.structure == 'registers') {
        // Creating an array of messages to be sent
        // Each message represents a dfifferent register
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            circuitId: node.id,
            payload: {
              structure: {
                creg: node.cbitsreg,
                qreg: node.qbitsreg,
              },
              register: i,
            },
            // additional message sent to the last output
            shouldInitCircuit: i == node.outputs - 1 ? true : false,
          };
          if (msg.req && msg.res) {
            output[i].req = msg.req;
            output[i].res = msg.res;
          }
        };
      } else { // If the user does not want to use registers
        // initialise qubit if binary string exists
        script += util.format(snippets.QUANTUM_CIRCUIT, node.qbitsreg + ', ' + node.cbitsreg);
        let binaryString = state.get('binaryString');
        if (binaryString) {
          script += util.format(snippets.INITIALIZE, binaryString, `qc.qubits`);
        }
        // Add arguments to quantum circuit code

        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            circuitId: node.id,
            payload: {
              structure: {
                qubits: node.qbitsreg,
                cbits: node.cbitsreg,
              },
              register: undefined,
              qubit: i,
            },
            // additional message sent to the last output
            shouldInitCircuit: i == node.outputs - 1 ? true : false,
          };
          if (msg.req && msg.res) {
            output[i].req = msg.req;
            output[i].res = msg.res;
          }
        };
        state.del('binaryString');
      }

      // Sending one register object per node output
      await shell.restart();
      await shell.execute(script, (err) => {
        logger.trace(node.id, 'Executed quantum circuit command');
        if (err) {
          logger.error(node.id, err);
          done(err);
        } else {
          send(output);
          done();
        }
      });
    });
  }

  // Http handlers for accessing and updating classical register information
  RED.httpAdmin.get('/quantum-circuit/registers', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    res.json({
      success: true,
      classicalRegisters: classicalRegisters,
    });
  });

  RED.httpAdmin.post('/quantum-circuit/update-register', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    let found = classicalRegisters.find((register) => register.nodeid === req.body.nodeid);
    if (found) {
      found.regName = req.body.regName;
      found.regVarName = req.body.regVarName;
      found.bits = req.body.bits;
      return res.json({
        success: true,
      });
    }

    classicalRegisters.push({
      nodeid: req.body.nodeid,
      regName: req.body.regName,
      regVarName: req.body.regVarName,
      bits: req.body.bits,
    });
    res.json({
      success: true,
    });
  });

  RED.httpAdmin.post('/quantum-circuit/delete-register', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    let index = classicalRegisters.findIndex((register) => register.nodeid === req.body.nodeid);
    if (index !== -1) {
      classicalRegisters.splice(index, 1);
      return res.json({
        success: true,
      });
    }
    res.json({
      success: false,
    });
  });

  // Http handlers for accessing and updating Quantum Circuit informaiton
  RED.httpAdmin.get('/quantum-circuit/structure', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    res.json({
      success: true,
      structure: quantumCircuitNode.structure,
    });
  });

  RED.httpAdmin.get('/quantum-circuit/bits', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    res.json({
      success: true,
      bits: quantumCircuitNode.cbitsreg,
    });
  });

  RED.httpAdmin.post('/quantum-circuit/update-circuit', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    quantumCircuitNode.structure = req.body.structure;
    quantumCircuitNode.outputs = req.body.outputs;
    quantumCircuitNode.cbitsreg = req.body.cbitsreg;
    quantumCircuitNode.qbitsreg = req.body.qbitsreg;

    res.json({
      success: true,
      quantumCircuitNode: quantumCircuitNode,
    });
  });

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
