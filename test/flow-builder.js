'use strict';

const barrierNode = require('../quantum/nodes/barrier/barrier.js');
const blochSphereNode = require('../quantum/nodes/bloch-sphere/bloch-sphere.js');
const circuitDiagramNode = require('../quantum/nodes/circuit-diagram/circuit-diagram.js');
const classicalRegisterNode = require('../quantum/nodes/classical-register/classical-register.js');
const cnotGateNode = require('../quantum/nodes/cnot-gate/cnot-gate.js');
const controlledUGateNode = require('../quantum/nodes/controlled-u-gate/controlled-u-gate.js');
const hadamardGateNode = require('../quantum/nodes/hadamard-gate/hadamard-gate.js');
const ibmQuantumSystemNode = require('../quantum/nodes/ibm-quantum-system/ibm-quantum-system.js');
const identityGateNode = require('../quantum/nodes/identity-gate/identity-gate.js');
const localSimulatorNode = require('../quantum/nodes/local-simulator/local-simulator.js');
const measureNode = require('../quantum/nodes/measure/measure.js');
const notGateNode = require('../quantum/nodes/not-gate/not-gate.js');
const phaseGateNode = require('../quantum/nodes/phase-gate/phase-gate.js');
const quantumCircuitNode = require('../quantum/nodes/quantum-circuit/quantum-circuit.js');
const quantumRegisterNode = require('../quantum/nodes/quantum-register/quantum-register.js');
const qubitNode = require('../quantum/nodes/qubit/qubit.js');
const resetNode = require('../quantum/nodes/reset/reset.js');
const rotationGateNode = require('../quantum/nodes/rotation-gate/rotation-gate.js');
const scriptNode = require('../quantum/nodes/script/script.js');
const swapNode = require('../quantum/nodes/swap/swap.js');
const toffoliGateNode = require('../quantum/nodes/toffoli-gate/toffoli-gate.js');
const unitaryGateNode = require('../quantum/nodes/unitary-gate/unitary-gate.js');


class FlowBuilder {
  constructor() {
    this.flow = [];
    this.nodes = [];
  }

  get flowString() {
    return JSON.stringify(this.flow);
  }

  reset() {
    this.flow = [];
    this.nodes = [];
  }

  add(node, json) {
    this.nodes.push(node);
    this.flow.push(json);
  }

  addHelper(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'helper', name: 'Helper Node'};
    Object.assign(json, properties);
    this.flow.push(json);
  }

  addBarrier(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'barrier', name: 'Barrier Node'};
    Object.assign(json, properties);
    this.add(barrierNode, json);
  }

  addBlochSphere(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'bloch-sphere', name: 'Bloch Sphere Node'};
    Object.assign(json, properties);
    this.add(blochSphereNode, json);
  }

  addCircuitDiagram(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'circuit-diagram', name: 'Circuit Diagram Node'};
    Object.assign(json, properties);
    this.add(circuitDiagramNode, json);
  }

  addClassicalRegister(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'classical-register', name: 'Classical Register Node'};
    Object.assign(json, properties);
    this.add(classicalRegisterNode, json);
  }

  addCnotGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'cnot-gate', name: 'CNot Gate Node'};
    Object.assign(json, properties);
    this.add(cnotGateNode, json);
  }

  addControlledUGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'controlled-u-gate', name: 'Controlled-U-Gate Node'};
    Object.assign(json, properties);
    this.add(controlledUGateNode, json);
  }

  addHadamardGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'hadamard-gate', name: 'Hadamard Gate Node'};
    Object.assign(json, properties);
    this.add(hadamardGateNode, json);
  }

  addIBMQuantumSystem(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'ibm-quantum-system', name: 'IBM Quantum System Node'};
    Object.assign(json, properties);
    this.add(ibmQuantumSystemNode, json);
  }

  addIdentityGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'identity-gate', name: 'Idenity Gate Node'};
    Object.assign(json, properties);
    this.add(identityGateNode, json);
  }

  addLocalSimulator(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'local-simulator', name: 'Local Simulator Node'};
    Object.assign(json, properties);
    this.add(localSimulatorNode, json);
  }

  addMeasure(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'measure', name: 'Measure Node'};
    Object.assign(json, properties);
    this.add(measureNode, json);
  }

  addNotGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'not-gate', name: 'Not Gate Node'};
    Object.assign(json, properties);
    this.add(notGateNode, json);
  }

  addPhaseGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'phase-gate', name: 'Phase Gate Node'};
    Object.assign(json, properties);
    this.add(phaseGateNode, json);
  }

  addQuantumCircuit(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'quantum-circuit', name: 'Quantum Circuit Node'};
    Object.assign(json, properties);
    this.add(quantumCircuitNode, json);
  }

  addQuantumRegister(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'quantum-register', name: 'Quantum Register Node'};
    Object.assign(json, properties);
    this.add(quantumRegisterNode, json);
  }

  addQubit(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'qubit', name: 'Qubit Node'};
    Object.assign(json, properties);
    this.add(qubitNode, json);
  }

  addReset(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'reset', name: 'Reset Node'};
    Object.assign(json, properties);
    this.add(resetNode, json);
  }

  addRotationGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'rotation-gate', name: 'Rotation Gate Node'};
    Object.assign(json, properties);
    this.add(rotationGateNode, json);
  }

  addScript(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'script', name: 'Script Node'};
    Object.assign(json, properties);
    this.add(scriptNode, json);
  }

  addSwap(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'swap', name: 'Swap Node'};
    Object.assign(json, properties);
    this.add(swapNode, json);
  }

  addToffoliGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'toffoli-gate', name: 'Toffoli Gate Node'};
    Object.assign(json, properties);
    this.add(toffoliGateNode, json);
  }

  addUnitaryGate(id, wires, properties) {
    let json = {id: id, wires: [wires], type: 'unitary-gate', name: 'Unitary Gate Node'};
    Object.assign(json, properties);
    this.add(unitaryGateNode, json);
  }
}

module.exports.FlowBuilder = FlowBuilder;
