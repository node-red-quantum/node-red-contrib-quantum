# node-red-quantum

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![CI Status](https://img.shields.io/github/workflow/status/louislefevre/node-red-contrib-quantum/Node.js%20CI)](https://github.com/louislefevre/node-red-contrib-quantum/actions/workflows/node.js.yml)
[![NPM](https://img.shields.io/npm/v/node-red-contrib-quantum)](https://www.npmjs.com/package/node-red-contrib-quantum)
[![Node](https://img.shields.io/node/v/node-red-contrib-quantum)](https://nodejs.org/en/)

**Node-RED Quantum** provides a set of nodes to build and run quantum computing algorithms within Node-RED.

Please be aware that this is a  **development version** of Node-RED Quantum, it is still a work in progress and the code is unstable. A full production-ready release will be published soon.

This module is a user-friendly library that is suitable to new quantum computing users thanks to its extensive documentation. It was designed to facilitate the integration of quantum algorithms within classical programs and is fully scalable since all the elemental quantum operations are included. 

This Node-RED library was developed in the context of a UCL IXN partnership with IBM. Defined and arranged by IBM, the project was allocated to students from UCL's computer science department as part of their Master's thesis. 

For the latest changes, please read the [CHANGELOG](CHANGELOG.md).

For more details on the authors, please read the [AUTHORS](AUTHORS) file.

For information on how to contribute, please read the [CONTRIBUTING](CONTRIBUTING.md) guidelines.

![Quantum Circuit example](./images/QuantumRandomNumber.png)

## Integrate quantum flow with external programs
This section provides a tutorial on how to integrate your quantum flow with external programs. To achieve this, you need to make use of Node-Red's built-in `httpin`, `catch`, `function`, and `httpout` node.

### Set up the HTTP endpoint for triggering the quantum flow
1. First drag and drop a `httpin` node to your flow, set the HTTP method to `post`.
2. Define the endpoint that you wish to trigger the quantum flow.
3. Connect the `httpin` node to the input of the `quantum circuit` node that you have created.
4. Drag and drop a `httpout` node, add a header `Content-Type` and set it to `application/json`.
5. Connect the `httpout` node with the output of `local simulator` node or `ibm quantum system` node, the execution result will then be sent back in JSON format to the requestor. A successful response will look like this:
    ```
    {
        "10 10": 1,
        "10 11": 2,
        "11 11": 3,
        "11 10": 4
    }
    ```

### How to trigger the quantum flow
To trigger the quantum flow, send a HTTP request to `http[s]://[host-address-of-node-red-instance]/[endpoint-name]` with a JSON payload `{binaryString: [string-of-binaries]}`, which represents the initial Qubit state that you wish to set for the quantum circuit. 

> If the Node-Red instance was deployed on a public cloud, make sure to check the firewall configurations and set up a reverse proxy server if necessary to bypass CORS regulations to the API endpoint.

### Error handling
You might want to add another block of nodes to do the error handling tasks in case of any failed execution, otherwise the flow will not response to the requestor.

1. Drag and drop a `catch` node from Node-Red, and set it to catch errors from all nodes.
2. Drag and drop a `function` node, paste the following code under the `on Message` tab:
    ```
    msg.payload.message=msg.error.message;
    msg.payload.source=msg.error.source;
    return msg;
    ```
    This will append the error message and the source node information which caused the error to the response body. An example error response will look like this:
    ```
    {
        "binaryString": "01010",
        "message": "Error: Binary string length mismatch. Expect: 4, actual: 5",
        "source": {
            "id": "de819baa.357618",
            "type": "quantum-circuit",
            "name": "",
            "count": 1
        }
    }
    ```
3. Drag and drop another `httpout` node, set the status code to `500` which represents internal server error.
4. Connect the above nodes in following order: `catch -> function -> httpout`.

## Prerequisites
Node-RED Quantum requires at minimum [Node-RED 1.0](https://nodered.org) and [Python 3](https://www.python.org/).
