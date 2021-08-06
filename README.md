# node-red-quantum

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
![NPM version]()
![NPM]()

**Node-RED Quantum** provides a set of nodes to build and run quantum computing algorithms within Node-RED. \
This module is a user-friendly library that is suitable to new quantum computing users thanks to its extensive documentation. \
It was designed to facilitate the integration of quantum algorithms within classical programs and is fully scalable since all the elemental quantum operations are included. 


This module require node.js version ... . 

For the latest changes, please read the [CHANGELOG.md]().

![Quantum Circuit example]()


## Pre-requisites

Node-RED Quantum requires [Node-RED](https://nodered.org) as well as [Python](https://www.python.org/).

## Install



## Features



## Using Node-RED Quantum



## Quantum Computing



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
