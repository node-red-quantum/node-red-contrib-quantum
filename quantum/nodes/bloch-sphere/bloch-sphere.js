'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

module.exports = function(RED) {
  function BlochSphereNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.qubits = [];
    this.qreg = '';
    const node = this;

    const reset = function() {
      node.qubits = [];
      node.qreg = '';
    };

    this.on('input', async function(msg, send, done) {
      let script = '';
      let qubitsArrived = true;

      let error = errors.validateQubitInput(msg);
      if (error) {
        done(error);
        reset();
        return;
      }
      // Throw Error if:
      // - The user connects it to a node that is not from the quantum library
      if (typeof(msg.payload.register) === 'undefined') {
        node.qubits.push(msg);
        node.qreg = undefined;

        // Check if all qubits arrived.
        if (node.qubits.length < msg.payload.structure.qubits) {
          qubitsArrived = false;
        }
      } else {
        // If the quantum circuit has registers
        // Keep track of qubits that have arrived and the remaining ones
        if (node.qubits.length == 0) node.qreg = {};

        // Throw an error if too many qubits are received by the simulator node
        // because the user connected qubits from different quantum circuits
        if ((
          !Object.keys(node.qreg).includes(msg.payload.registerVar) &&
          Object.keys(node.qreg).length == msg.payload.structure.qreg
        ) || (
          Object.keys(node.qreg).includes(msg.payload.registerVar) &&
          node.qreg[msg.payload.registerVar].count == node.qreg[msg.payload.registerVar].total
        )) {
          done(new Error(errors.QUBITS_FROM_DIFFERENT_CIRCUITS));
          reset();
          return;
        }

        // Storing information about which qubits were received
        if (Object.keys(node.qreg).includes(msg.payload.registerVar)) {
          node.qreg[msg.payload.registerVar].count += 1;
        } else {
          node.qreg[msg.payload.registerVar] = {
            total: msg.payload.totalQubits,
            count: 1,
          };
        }

        node.qubits.push(msg);

        // Checking whether all qubits have arrived or not
        if (Object.keys(node.qreg).length == msg.payload.structure.qreg) {
          Object.keys(node.qreg).map((key) => {
            if (node.qreg[key].count < node.qreg[key].total) {
              qubitsArrived = false;
            }
          });
        } else {
          qubitsArrived = false;
        }
      }

      if (qubitsArrived) {
        // Checking that all qubits received as input are from the same quantum circuit
        let error = errors.validateQubitsFromSameCircuit(node.qubits);
        if (error) {
          done(error);
          reset();
          return;
        }

        node.qubits = [];
        node.qreg = '';

        script += util.format(snippets.BLOCH_SPHERE);
        await shell.execute(script, (err, data)=>{
          // console.log(shell.script.trim());
          if (err) {
            // check if its because script contain qc.measure
            // snippets.measure.tostring()[4] output is: 'qc.m'
            if (shell.script.includes(snippets.MEASURE.toString()[4])) {
              done('Measure Node should not be included as part of the quantum circuit while using Bloch Sphere Diagram Node.\nPlease unlink or remove any measure nodes.');
            } else {
            // other problem
              done(err);
            }
          } else {
            msg.payload = data.split('\'')[1];
            msg.encoding = 'base64';
            send(msg);
            done();
          }
        });
      }
    });
  };
  RED.nodes.registerType('bloch-sphere', BlochSphereNode);
};
