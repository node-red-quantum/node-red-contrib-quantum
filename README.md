# Node-RED Quantum
Quantum computing functionality for Node-RED.

## Installation for Developers
- Install Python, Node.js, and NPM.  
- Clone the repository and navigate into it:  
  `git clone https://github.com/louislefevre/node-red-contrib-quantum.git`  
  `cd node-red-contrib-quantum/`  
- Install dependencies with NPM:  
  `npm install`  
- Setup virtual Python environment:  
  `npm run setup`  
- Open Node-RED. The following command will first try and run any global installations of Node-RED, otherwise it will run the local installation which is installed as a dependency:  
  `npm start`  
- Navigate to the following URL in your web browser:  
  `http://127.0.0.1:1880/`  
- Before committing any JavaScript code, run the linting command:  
  `npm run lint`  
