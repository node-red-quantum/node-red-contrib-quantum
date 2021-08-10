# node-red-quantum

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![CI Status](https://img.shields.io/github/workflow/status/louislefevre/node-red-contrib-quantum/Node.js%20CI)](https://github.com/louislefevre/node-red-contrib-quantum/actions/workflows/node.js.yml)
[![NPM](https://img.shields.io/npm/v/node-red-contrib-quantum)](https://www.npmjs.com/package/node-red-contrib-quantum)
[![Node](https://img.shields.io/node/v/node-red-contrib-quantum)](https://nodejs.org/en/)

**Node-RED Quantum** provides a set of nodes to build and run quantum computing algorithms within Node-RED.

Please be aware that this is a  **development version** of Node-RED Quantum, it is still a work in progress and the code is unstable. A full production-ready release will be published soon.

This module is a user-friendly library that is suitable to new quantum computing users thanks to its extensive documentation. It was designed to facilitate the integration of quantum algorithms within classical programs and is fully scalable since all the elemental quantum operations are included. 

This Node-RED library was developed in the context of a UCL IXN partnership with IBM. Defined and arranged by IBM, the project was allocated to students from UCL's computer science department as part of their Master's thesis. 

For more details on the authors, please read the [AUTHORS](AUTHORS) file.

For the latest changes, please read the [CHANGELOG](CHANGELOG.md).

![Quantum Circuit example](./images/QuantumRandomNumber.png)

## Prerequisites
Node-RED Quantum requires at minimum [Node-RED 1.0](https://nodered.org) and [Python 3](https://www.python.org/).

## Developers
### Installation
- Install Python, Node.js, and NPM.  
- Clone the repository and navigate into it:  
  `git clone https://github.com/louislefevre/node-red-contrib-quantum.git`  
  `cd node-red-contrib-quantum/`  
- Install dependencies, link the package to Node-RED, and setup the Python virtual environment:  
  `npm run setup`  
- Open Node-RED. The following command will first try and run any global installations of Node-RED, otherwise it will run the local installation which is installed as a dependency:  
  `npm start`  
- Navigate to the following URL in your web browser:  
  `http://127.0.0.1:1880/`  

### Creating Nodes
- A basic template for new nodes has been setup in the [*template*](template/) directory.  
- Copy the [*node-template*](template/node-template) directory to [*quantum/nodes*](quantum/nodes/), and rename every instance of "node-template", "node template", or "NodeTemplate" with the name of your new node (including the folder and file names).  
- For the node to appear in Node-RED, it needs to be added to [*package.json*](package.json). Navigate to the file and locate the "node-red" key, and under "nodes" add the name of your new node and the path of its JavaScript file from root (e.g.`"node-template": "quantum/nodes/node-template/node-template.js"`).  
- Before committing any JavaScript code, run the linting command:  
  `npm run lint`  

### Writing Unit Tests
- Unit tests are written using the [Mocha](https://mochajs.org/) testing framework, whilst utilising [Chai.js](https://www.chaijs.com/) for assertions.
- Test suites for nodes should be in a single file with the format *\<node-name\>_spec.js*. For example, the Quantum Circuit node would have a test suite named *quantum-circuit_spec.js*.
- All test suites should be placed in the [*test*](test/) directory.
- Unit tests should be grouped using the `describe()` function provided by Mocha:
  - When testing a class, unit test groups should be nested, with the enclosed groups containing tests for each individual method/property.
  - When testing functions not within a class, unit tests should be enclosed within a single test group.
- Test groups and their unit tests should be labelled as follows:
  - Top-level groups should be labelled according to the class/function being tested.
  - Instance methods/properties within a class should be prefixed with a hash symbol (**#**).
  - Static methods/properties within a class should be prefixed with a period (**.**).
  - Unit test labels should start with a lowercase letter and succinctly describe what is being tested.
```node
// Testing a class
describe('MyClass', () => {
  describe('#instanceMethod', () => {
    it('test one', () => {...});
  });

  describe('.staticMethod', () => {
    it('test two', () => {...});
  });
});

// Testing a function
describe('MyFunction', () => {
  it('test three', () => {...});
  it('test four', () => {...});
});
```
