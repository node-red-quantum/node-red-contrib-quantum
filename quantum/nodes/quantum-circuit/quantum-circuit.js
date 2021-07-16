'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;

module.exports = function(RED) {
  let quantumCircuitNode;
  let classicalRegisters = [];
  function QuantumCircuitNode(config) {
    // Creating node with properties and context
    RED.nodes.createNode(this, config);
    quantumCircuitNode = this;
    this.name = config.name;
    this.structure = config.structure;
    this.cbits = parseInt(config.cbits);
    this.outputs = parseInt(config.outputs);
    const flowContext = this.context().flow;
    const output = new Array(this.outputs);
    const node = this;

    this.on('input', async function(msg, send, done) {
      await shell.restart();
      await shell.execute(snippets.IMPORTS, (err) => {
        if (err) node.error(err);
      });

      // If the user wants to use registers
      if (node.structure == 'registers') {
        // Creating a temporary 'quantumCircuit' flow context array
        // This variable represents the quantum circuit structure
        let quantumCircuit = new Array(node.outputs);
        flowContext.set('quantumCircuit', quantumCircuit);

        // Creating an array of messages to be sent
        // Each message represents a dfifferent register
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: i,
            },
          };
        };
      } else { // If the user does not want to use registers
        // Add arguments to quantum circuit code
        let circuitScript = util.format(snippets.QUANTUM_CIRCUIT, node.outputs + ',' + node.cbits);
        await shell.execute(circuitScript, (err) => {
          if (err) node.error(err);
        });

        // Creating an array of messages to be sent
        // Each message represents a different qubit
        for (let i = 0; i < node.outputs; i++) {
          output[i] = {
            topic: 'Quantum Circuit',
            payload: {
              register: undefined,
              qubit: i,
            },
          };
        };
      }

      // Sending one register object per node output
      send(output);
    });
  }

  // Http handlers for accessing and updating classical register information
  RED.httpAdmin.get('/quantum-circuit/registers', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    res.json({
      success: true,
      classicalRegisters: classicalRegisters
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
      bits: req.body.bits
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
      structure: quantumCircuitNode.structure
    });
  });

  RED.httpAdmin.get('/quantum-circuit/bits', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    res.json({
      success: true,
      bits: quantumCircuitNode.cbits
    });
  });

  RED.httpAdmin.post('/quantum-circuit/update-circuit', RED.auth.needsPermission('quantum-circuit.read'), function(req, res) {
    quantumCircuitNode.structure = req.body.structure;
    quantumCircuitNode.outputs = req.body.outputs;
    quantumCircuitNode.cbits = req.body.cbits;

    res.json({
      success: true,
      quantumCircuitNode: quantumCircuitNode
    });
  });

  RED.nodes.registerType('quantum-circuit', QuantumCircuitNode);
};
