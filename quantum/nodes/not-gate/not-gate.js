module.exports = function(RED) {
  'use strict';

  function NodeTemplateNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
  }

  function NotGate(config){

    RED.nodes.createNode(this, config);

    this.name = config.name;
    this.outputs = config.outputs;

    const globalContext = this.context().global;
    const node = this;
    const output = new Array(node.outputs);

    //creating not gate here.

    node.on("input", (msg, send, done) => {

      let qiskitScript = "\nqc = x("+ document.getElementByID("control-qubit-1").value +")";
      let oldScript = globalContext.get("script");
      globalContext.set("script", oldScript + qiskitScript);

      for (let i = 0; i < node.outputs; i++){

        output[i] = {

          topic: "Quantum Circuit",
          payload: {

            register: "qr" + msg.payload.register.toString(),
            qubit: i,

          },

        };

      }

      send(output);

    })
    

  }


  RED.nodes.registerType('not-gate', NodeTemplateNode);
};
