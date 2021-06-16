// The function is exported and gets called when the node is started-up
module.exports = function(RED) {  // RED is an object that allows access to Node-RED API
    'use strict'
    
    function LowerCaseNode(config) {  // Config is an object containing properties set by the user in the flow editor
        RED.nodes.createNode(this,config);  // Initialize the features shared by all nodes
        var node = this;
        
        node.on('input', function(msg) {  // Listender for input - executes when a message is received by the node.
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }

    // Registers the function with the runtime, and defines the name of the node.
    RED.nodes.registerType("lower-case",LowerCaseNode);
}
