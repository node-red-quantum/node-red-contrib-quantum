'use strict';

const NODES = {
  'barrier': require('../nodes/quantum/barrier/barrier.js'),
  'bloch-sphere': require('../nodes/quantum/bloch-sphere/bloch-sphere.js'),
  'circuit-diagram': require('../nodes/quantum/circuit-diagram/circuit-diagram.js'),
  'classical-register': require('../nodes/quantum/classical-register/classical-register.js'),
  'cnot-gate': require('../nodes/quantum/cnot-gate/cnot-gate.js'),
  'controlled-u-gate': require('../nodes/quantum/controlled-u-gate/controlled-u-gate.js'),
  'grovers': require('../nodes/quantum-algorithms/grovers/grovers.js'),
  'hadamard-gate': require('../nodes/quantum/hadamard-gate/hadamard-gate.js'),
  'ibm-quantum-system': require('../nodes/quantum/ibm-quantum-system/ibm-quantum-system.js'),
  'identity-gate': require('../nodes/quantum/identity-gate/identity-gate.js'),
  'local-simulator': require('../nodes/quantum/local-simulator/local-simulator.js'),
  'measure': require('../nodes/quantum/measure/measure.js'),
  'multi-controlled-u-gate': require('../nodes/quantum/multi-controlled-u-gate/multi-controlled-u-gate.js'),
  'not-gate': require('../nodes/quantum/not-gate/not-gate.js'),
  'phase-gate': require('../nodes/quantum/phase-gate/phase-gate.js'),
  'quantum-circuit': require('../nodes/quantum/quantum-circuit/quantum-circuit.js'),
  'quantum-register': require('../nodes/quantum/quantum-register/quantum-register.js'),
  'qubit': require('../nodes/quantum/qubit/qubit.js'),
  'reset': require('../nodes/quantum/reset/reset.js'),
  'rotation-gate': require('../nodes/quantum/rotation-gate/rotation-gate.js'),
  'script': require('../nodes/quantum/script/script.js'),
  'swap': require('../nodes/quantum/swap/swap.js'),
  'toffoli-gate': require('../nodes/quantum/toffoli-gate/toffoli-gate.js'),
  'unitary-gate': require('../nodes/quantum/unitary-gate/unitary-gate.js'),
};

class FlowBuilder {
  constructor() {
    this.flow = [];
    this.nodes = [];
  }

  /**
   * Return the flow JSON as a string.
   *
   * This method is primarily intended for debugging purposes.
   *
   * @return {string} The JSON representation of the flow.
  */
  get flowString() {
    return JSON.stringify(this.flow);
  }

  /**
   * Return the ID of the first node.
   *
   * @return {string} The nodes ID string.
  */
  get inputId() {
    return this.flow[0].id;
  }

  /**
   * Return the ID of the last node.
   *
   * @return {string} The nodes ID string.
  */
  get outputId() {
    return this.flow[this.flow.length - 1].id;
  }

  /**
   * Add a quantum node to the flow.
   *
   * @param {string} name The name of the node.
   * @param {string} id The id of the node.
   * @param {string[]} wires The nodes which are connected to the output.
   * @param {Object.<string, string>} properties The properties of the node (optional).
  */
  add(name, id, wires, properties) {
    if (!NODES.hasOwnProperty(name)) {
      throw new Error(`Failed to find node ${name}`);
    }
    let json = {id: id, wires: wires, type: name, name: name.replace(/-/g, ' ')};
    Object.assign(json, properties);
    if (!this.nodes.includes(NODES[name])) {
      this.nodes.push(NODES[name]);
    }
    this.flow.push(json);
  }

  /**
   * Add an output node to the flow.
   *
   * This is a node provided by the Node-RED Test Helper specifically for reading
   * the output of the flow. This node should usually be the last node in the flow.
   *
   * @param {string} id The id of the node.
  */
  addOutput(id) {
    let json = {id: id, type: 'helper', name: 'output'};
    this.flow.push(json);
  }

  /**
   * Reset the flow to be empty.
  */
  reset() {
    this.flow = [];
    this.nodes = [];
  }
}

module.exports.FlowBuilder = FlowBuilder;
