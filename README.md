# node-red-quantum <!-- omit in toc -->
[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![CI Status](https://img.shields.io/github/workflow/status/node-red-quantum/node-red-contrib-quantum/Node.js%20CI)](https://github.com/node-red-quantum/node-red-contrib-quantum/actions/workflows/node.js.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/node-red-quantum/node-red-contrib-quantum)](https://coveralls.io/github/node-red-quantum/node-red-contrib-quantum?branch=master)
[![NPM](https://img.shields.io/npm/v/node-red-contrib-quantum)](https://www.npmjs.com/package/node-red-contrib-quantum)
[![Node](https://img.shields.io/node/v/node-red-contrib-quantum)](https://nodejs.org/en/)

**Node-RED Quantum** provides a set of nodes to build and run quantum computing algorithms within Node-RED.

Please be aware that this is a  **development version** of Node-RED Quantum, it is still a work in progress and the code is unstable. A full production-ready release will be published soon.

This module is a user-friendly library that is suitable for new quantum computing users thanks to its extensive documentation. It was designed to facilitate the integration of quantum algorithms within classical programs and is fully scalable since all the elemental quantum operations are included.

This Node-RED library was developed in the context of a [UCL IXN](https://www.ucl.ac.uk/computer-science/collaborate/ucl-industry-exchange-network-ucl-ixn) partnership with [IBM](https://www.ibm.com/uk-en). Defined and arranged by IBM, the project was allocated to students from UCL's computer science department as part of their Master's thesis.

For the latest changes, please read the [CHANGELOG](CHANGELOG.md).

For more details on the authors, please read the [AUTHORS](AUTHORS) file.

For information on how to contribute, please read the [CONTRIBUTING](CONTRIBUTING.md) guidelines.

![Quantum Circuit example](./resources/quantum-circuit-examples/quantum-random-number.png)

<br /><br />

# Table of contents <!-- omit in toc -->
- [Pre-requisites](#pre-requisites)
- [Install](#install)
- [About Quantum Computing](#about-quantum-computing)
- [*'Quantum'* nodes - Building quantum circuits](#quantum-nodes---building-quantum-circuits)
- [*'Quantum Algorithms'* nodes - Leveraging quantum computing](#quantum-algorithms-nodes---leveraging-quantum-computing)
- [Tutorials & Examples](#tutorials--examples)

<br />

# Pre-requisites
Node-RED Quantum requires at minimum [Node.js 12.0.0](https://nodejs.org/en/), [Node-RED 1.0](https://nodered.org) and [Python 3](https://www.python.org/).

<br />

# Install

1. In the terminal of your machine, install **Node-RED** by executing the command:
   `sudo npm install -g --unsafe-perm node-red`.

2. Once **Node-RED** has been installed, start the application by entering the command `node-red` in the terminal.
3. Navigate to **Node-RED** by following the IP address returned in the terminal. This will usually be `http://127.0.0.1:1880/`.
4. In **Node-RED**, navigate to the **Palette Manager** (top-right corner), select **Install** and search for *'quantum'*, as depicted below.
5. Install the **node-red-contrib-quantum** package. Once installed, it will show as quantum nodes in the **Palette** (on the left of the Node-RED editor). Please note that this installation may take a few minutes, as it needs to install the Python virtual environment required for executing the nodes.

![Node-RED palette manager](./resources/installation-guide/palette-manager.png)

<br />

# About Quantum Computing

## Qubit State <!-- omit in toc -->

A qubit is the same to a quantum computer than what a bit is to a classical computer: the smallest unit of information.<br />
<a href="https://qiskit.org/textbook/ch-states/representing-qubit-states.html#statevectors"> Classical vs Quantum bits - Qiskit textbook</a>
<br /><br />
The <b>Bloch sphere</b> representation is considered as the most simple and ludic way to understand & visualise a qubit (see image below).
In contrast with classical bits that can only be in a '0' or a '1' state, qubits can store much more information.
In fact, all points on the sphere represent a different qubit state, the usual classical bit states being labelled as:
<ul>
<li>State 0</li>
<li>State 1</li>
</ul>
Quantum states that are in between those 2 points are a weighted combination of the '0' and '1' states. This is called <b>superposition</b>. <br/>
To set the qubit in a particular state, we operate rotations or reflections of the <b>Bloch sphere</b> while keeping the x, y and z axis unchanged.<br />
<a href="https://qiskit.org/textbook/ch-states/representing-qubit-states.html#bloch-sphere-2">Bloch Sphere - Qiskit textbook</a>
<br /><br />
<b>Example -</b> Applying a &#960; radians rotation about the x-axis on a qubit that is in the '0 state' will put it in the '1 state'. 
<br/><br/>

<img  src="./resources/quantum-computing/bloch-sphere-horizontal.png" width="750px"/><br />

## Qubit Measurement <!-- omit in toc -->

It is very important to understand that, even though a qubit can take an infinite number of states, our technology only allows us to measure '0' or '1', like on a classical bit. Since we measure and interpret a qubit state using classical machines, this can be seen as a projection of quantum computing back to classical computing: from quantum states back to binary values. <br />
<a href="https://qiskit.org/textbook/ch-states/representing-qubit-states.html#rules-measurement">Qubit measurement - Qiskit textbook</a>
<br /><br />
This leads to probabilistic measurement results.
In terms of the <b>Bloch Sphere</b>, the closest the qubit state is from the '1 state', the more likely we are to measure a '1'. 
<br/><br/>
<b>Example -</b> If we measure a 1000 times a qubit that has a state in the x-y plane, then we will get more or less 500 '0' measurements and 500 '1' measurements. 
<br/><br/>
<b>Careful -</b> The act of measuring a qubit collapses the qubit state: the state of the qubit after being measured 
is not representative of the qubit state before the measurement. Please measure the qubits at the end of the quantum circuit or reset them after a measurement.

<br />

## Entanglement <!-- omit in toc -->

Referred to as a "spooky action at a distance" by Albert Einstein, **entanglement** is a quantum phenomenon that is extremely powerful in quantum computing. It is a form of connection that can exist between any number of qubits. Here we will illustrate **entanglement** between two qubits.
<br /><br />
Two qubits are said to be **entangled** when their relative states rely on each other. In other words, changing or knowing the state of one qubit can change the state of the other qubit. This connection is independent of time and space: the two qubits can be miles appart and the connection will still be instantaneous.
<br /><br />
In practice, **entanglement** arises when the operation of a gate on a qubit is conditional on the state of another qubit (similar to an `if` block in classical computing). These gates are often referred to as [multi-qubits quantum gates](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Quantum-Gate-Nodes/#multi-qubits-quantum-gates). 
<br /><br />
<b>Example -</b> A CNOT gate applies a NOT gate (0 &#8594; 1 & 1 &#8594; 0) to the 'target' qubit **if and only if** the 'control' qubit is in the '1' state.
<br /><br />
Now, let's assume that the 'control' qubit is in a <b>superposition</b> state (25% '0' / 75% '1'), while the 'target' qubit is in the '0' state.<br />
Then, the **combined** state of the 2 qubits after applying the CNOT gate will be:
<ul>
    <li>'00' with 25% probability</li>
    <li>'11' with 75% probability</li>
</ul>
The 2 qubits are now <b>entangled</b>. If we measure one of them to be in the '1' state, then we know that other qubit will be in the '1' state as well.
<br /><br />
<a href="https://qiskit.org/textbook/ch-gates/multiple-qubits-entangled-states.html#entangled">Entanglement - Qiskit textbook</a>  
<br /><br />

# *'Quantum'* nodes - Building quantum circuits
* [Circuit Initialisation nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Circuit-Initialisation-Nodes)
* [Qubit Control nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Qubit-Control-Nodes)
* [Quantum Gate nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Quantum-Gate-Nodes)
* [Circuit Output nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Circuit-Output-Nodes)

<br/>

For detailed information on how to use each node, please head to the [Node-RED Quantum wiki](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki).

<br />

# *'Quantum Algorithms'* nodes - Leveraging quantum computing

For detailed information on how to use each node, please head to the [Node-RED Quantum wiki](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki).

<br />

# Tutorials & Examples

<br />
