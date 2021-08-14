'use strict';

const NODES = {
  'barrier': require('../quantum/nodes/barrier/barrier.js'),
  'bloch-sphere': require('../quantum/nodes/bloch-sphere/bloch-sphere.js'),
  'circuit-diagram': require('../quantum/nodes/circuit-diagram/circuit-diagram.js'),
  'classical-register': require('../quantum/nodes/classical-register/classical-register.js'),
  'cnot-gate': require('../quantum/nodes/cnot-gate/cnot-gate.js'),
  'controlled-u-gate': require('../quantum/nodes/controlled-u-gate/controlled-u-gate.js'),
  'hadamard-gate': require('../quantum/nodes/hadamard-gate/hadamard-gate.js'),
  'ibm-quantum-system': require('../quantum/nodes/ibm-quantum-system/ibm-quantum-system.js'),
  'identity-gate': require('../quantum/nodes/identity-gate/identity-gate.js'),
  'local-simulator': require('../quantum/nodes/local-simulator/local-simulator.js'),
  'measure': require('../quantum/nodes/measure/measure.js'),
  'not-gate': require('../quantum/nodes/not-gate/not-gate.js'),
  'phase-gate': require('../quantum/nodes/phase-gate/phase-gate.js'),
  'quantum-circuit': require('../quantum/nodes/quantum-circuit/quantum-circuit.js'),
  'quantum-register': require('../quantum/nodes/quantum-register/quantum-register.js'),
  'qubit': require('../quantum/nodes/qubit/qubit.js'),
  'reset': require('../quantum/nodes/reset/reset.js'),
  'rotation-gate': require('../quantum/nodes/rotation-gate/rotation-gate.js'),
  'script': require('../quantum/nodes/script/script.js'),
  'swap': require('../quantum/nodes/swap/swap.js'),
  'toffoli-gate': require('../quantum/nodes/toffoli-gate/toffoli-gate.js'),
  'unitary-gate': require('../quantum/nodes/unitary-gate/unitary-gate.js'),
};

class FlowBuilder {
  constructor() {
    this.flow = [];
    this.nodes = [];
  }

  get flowString() {
    return JSON.stringify(this.flow);
  }

  add(type, id, wires, properties) {
    if (!NODES.hasOwnProperty(type)) {
      throw new Error(`Failed to find node ${type}`);
    }
    let name = type.replace(/-/g, ' ');
    let json = {id: id, wires: [wires], type: type, name: name};
    Object.assign(json, properties);
    this.nodes.push(NODES[type]);
    this.flow.push(json);
  }

  addOutput(id) {
    let json = {id: id, type: 'helper', name: 'output'};
    this.flow.push(json);
  }

  reset() {
    this.flow = [];
    this.nodes = [];
  }
}

module.exports.FlowBuilder = FlowBuilder;
