# Contributing
Guidelines on setting up the project, creating new nodes, and writing unit tests for those nodes.

## Installation
- Install Python, Node.js, and NPM.  
- Clone the repository and navigate into it:  
  `git clone https://github.com/node-red-quantum/node-red-contrib-quantum.git`  
  `cd node-red-contrib-quantum/`  
- Install dependencies, link the package to Node-RED, and setup the Python virtual environment:  
  `npm run setup`  
- Open Node-RED. The following command will first try and run any global installations of Node-RED, otherwise it will run the local installation which is installed as a dependency:  
  `npm start`  
- Navigate to the following URL in your web browser:  
  `http://127.0.0.1:1880/`  

## Creating Nodes
- Basic templates for new nodes can be found in the [*templates*](templates/) directory.  
- Copy the appropriate node template to [*nodes/quantum*](nodes/quantum/) or [*nodes/quantum-algorithms*](nodes/quantum-algorithms), and ensure that you replace every instance of templates name with the name of your new node (including the folder and file names).  
- For the node to appear in Node-RED, it needs to be added to [*package.json*](package.json). Navigate to the file and locate the "node-red" key, and under "nodes" add the name of your new node and the path of its JavaScript file from root (e.g.`"node-template": "nodes/quantum/node-template/node-template.js"`).  
- Before committing any JavaScript code, run the linting command:  
  `npm run lint`  

## Writing Unit Tests
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
