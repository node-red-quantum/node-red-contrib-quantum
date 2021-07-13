# Node-RED Quantum
Quantum computing functionality for Node-RED.

## Installation for Developers
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
- Before committing any JavaScript code, run the linting command:  
  `npm run lint`  

## Creating Nodes
- A basic template for new nodes has been setup in the [*template*](template/) directory.  
- Simply copy the [*node-template*](template/node-template) directory to the appropriate location (usually one of the directories under [*quantum*](quantum/)), and rename every instance of "node-template", "node template", or "NodeTemplate" with the name of your new node (including the folder and file names).  
- For the node to appear in Node-RED, it needs to be added to [*package.json*](package.json). Navigate to the file and locate the "node-red" key, and under "nodes" add the name of your new node and the path of its JavaScript file from root (e.g.`"new-node": "quantum/terra/new-node/new-node.js"`).  
