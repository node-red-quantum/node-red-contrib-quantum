<!-- markdownlint-disable MD022 MD032 MD024 -->

# node-red-quantum
[![Platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![CI Status](https://img.shields.io/github/workflow/status/node-red-quantum/node-red-contrib-quantum/Node.js%20CI)](https://github.com/node-red-quantum/node-red-contrib-quantum/actions/workflows/node.js.yml)
[![Coverage Status](https://img.shields.io/coveralls/github/node-red-quantum/node-red-contrib-quantum)](https://coveralls.io/github/node-red-quantum/node-red-contrib-quantum?branch=master)
[![NPM](https://img.shields.io/npm/v/node-red-contrib-quantum)](https://www.npmjs.com/package/node-red-contrib-quantum)
[![Node](https://img.shields.io/node/v/node-red-contrib-quantum)](https://nodejs.org/en/)

**Node-RED Quantum** provides a set of nodes to build and run quantum computing algorithms within Node-RED.

Please be aware that this is a  ***development version*** of Node-RED Quantum, it is still a work in progress and the code is unstable.

The aim of this module is to help introduce users to quantum computing by providing a library of highly documented nodes for building and running quantum circuits in Node-RED. It was designed to facilitate the integration of quantum algorithms within classical programs, and allows for scalability by providing the fundamental quantum circuit building blocks.

For detailed documentation on how to use each node, please head to the [Node-RED Quantum wiki](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki).

For the latest changes, please read the [CHANGELOG](CHANGELOG.md).

![Quantum Circuit](./resources/quantum-circuit-examples/quantum-random-number.png)

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [About Quantum Computing](#about-quantum-computing)
  - [Qubit State](#qubit-state)
  - [Qubit Measurement](#qubit-measurement)
  - [Entanglement](#entanglement)
- [Quantum Nodes](#quantum-nodes)
- [Quantum Algorithm Nodes](#quantum-algorithm-nodes)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

## Prerequisites
Node-RED Quantum requires at minimum [Node.js 12.0.0](https://nodejs.org/en/), [Node-RED 1.0](https://nodered.org), and [Python 3](https://www.python.org/).

## Installation
1. Install Node-RED locally by following the installation instructions [here](https://nodered.org/docs/getting-started/local).
2. Once Node-RED has been installed, start the application by entering the command `node-red` in the terminal.
3. Open the Node-RED interface by navigating to the IP address the server is running at in your browser. This will usually be `http://127.0.0.1:1880/`.
4. In Node-RED, navigate to the **Palette Manager** (top-right corner), select **Install** and search for *'quantum'*, as depicted below.
5. Install the **node-red-contrib-quantum** package. Once installed, the quantum nodes provided by this library will show in the **Palette** (on the left-side of the Node-RED editor). Please note that this installation may take a few minutes, as it needs to install the Python virtual environment required for executing the nodes.

![Node-RED palette manager](./resources/installation-guide/palette-manager.png)

## About Quantum Computing
### Qubit State
A qubit is the same to a quantum computer as what a bit is to a classical computer: the smallest unit of information.  

The **Bloch sphere** representation is considered the most simple and ludic way to understand & visualise a qubit (see example below). In contrast with classical bits that can only be in a '0' or a '1' state, qubits can store much more information. In fact, all points on the sphere represent a different qubit state, the usual classical bit states being labelled as:
- State 0
- State 1

Quantum states that are in between those 2 points are a weighted combination of the '0' and '1' states. This is called **superposition**. To set the qubit in a particular state, we operate rotations or reflections of the **Bloch sphere** while keeping the x, y and z axis unchanged.

The Qiskit textbook provides more information on [classical vs quantum bits](https://qiskit.org/textbook/ch-states/representing-qubit-states.html#statevectors), as well as [bloch spheres](https://qiskit.org/textbook/ch-states/representing-qubit-states.html#bloch-sphere-2).

#### Example
Applying a &#960; radians rotation about the x-axis on a qubit that is in the '0 state' will put it in the '1 state'.
![Bloch sphere](./resources/quantum-computing/bloch-sphere-horizontal.png)

### Qubit Measurement
It is very important to understand that even though a qubit can take an infinite number of states, modern technology only allows us to measure '0' or '1', same as a classical bit. Since we measure and interpret a qubit state using classical machines, this can be seen as a projection of quantum computing back to classical computing: from quantum states back to binary values.

This leads to probabilistic measurement results. In terms of the **Bloch Sphere**, the closest the qubit state is from the '1' state, the more likely we are to measure a '1'.

The act of measuring a qubit collapses the qubit state; the state of the qubit after being measured is not representative of the qubit state before the measurement. You must be careful to ensure that measurement of the qubits happens at the end of the quantum circuit, or reset them after a measurement.

More information on qubit measurement can be found in the [Qiskit Textbook](https://qiskit.org/textbook/ch-states/representing-qubit-states.html#rules-measurement)

#### Example
If we measure a qubit that has a state in the x-y plane 1000 times, then we will approximately get 500 '0' measurements and 500 '1' measurements.

### Entanglement
Referred to as a "spooky action at a distance" by Albert Einstein, **entanglement** is a quantum phenomenon that is extremely powerful in quantum computing; it is a form of connection that can exist between any number of qubits. Here we will illustrate **entanglement** between two qubits.

Two qubits are said to be **entangled** when their relative states rely on each other. In other words, changing or knowing the state of one qubit can change the state of the other qubit. This connection is independent of time and space: the two qubits can be miles appart and the connection will still be instantaneous.

In practice, **entanglement** arises when the operation of a gate on a qubit is conditional on the state of another qubit (similar to an `if` block in classical computing). These gates are often referred to as [multi-qubits quantum gates](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Quantum-Gate-Nodes/#multi-qubits-quantum-gates).

More information on entanglement can be found in the [Qiskit Textbook](https://qiskit.org/textbook/ch-gates/multiple-qubits-entangled-states.html#entangled)

#### Example
A CNOT gate applies a NOT gate (0 &#8594; 1 & 1 &#8594; 0) to the 'target' qubit **if and only if** the 'control' qubit is in the '1' state.

Now, let's assume that the 'control' qubit is in a **superposition** state (25% '0' / 75% '1'), while the 'target' qubit is in the '0' state. Then, the **combined** state of the 2 qubits after applying the CNOT gate will be:
- '00' with 25% probability
- '11' with 75% probability

The 2 qubits are now **entangled**: if we measure one of them to be in the '1' state, then we know that other qubit will be in the '1' state as well.

## Quantum Nodes
Quantum circuits can be built through the use of the *'quantum'* nodes provided by this library.
- [Circuit Initialisation nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Circuit-Initialisation-Nodes)
- [Qubit Control nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Qubit-Control-Nodes)
- [Quantum Gate nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Quantum-Gate-Nodes)
- [Circuit Output nodes](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Circuit-Output-Nodes)

More information on quantum nodes can be found in the [Node-RED Quantum wiki](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Building-Quantum-Circuits).

## Quantum Algorithm Nodes
To leverage the power of quantum computing in classical circuits, utilise the *'quantum algorithm'* nodes.

More information on quantum algorithm nodes can be found in the [Node-RED Quantum wiki](https://github.com/node-red-quantum/node-red-contrib-quantum/wiki/Quantum-Algorithm-Nodes).

## Contributing
For information on how to contribute, please read the [CONTRIBUTING](CONTRIBUTING.md) guidelines.

## Acknowledgements
For details on the authors, please read the [AUTHORS](AUTHORS) file.

This Node-RED library was developed in the context of a [UCL IXN](https://www.ucl.ac.uk/computer-science/collaborate/ucl-industry-exchange-network-ucl-ixn) partnership with [IBM](https://www.ibm.com/uk-en). Defined and arranged by IBM, the project was allocated to students from UCL's computer science department as part of their Master's thesis. Special thanks to John McNamara for overseeing the development of this project, and David Clark for his advice and guidance.
