module.exports = function(RED) {
  'use strict';

  function HadamardGate(config) {
    RED.nodes.createNode(this, config);
    const globalContext = this.context().global;
    const node = this;

    node.on('input', (msg, send, done) => {
      let qrConfig = msg.payload;
      let keys = Object.keys(qrConfig);
      if (!keys.includes('register') || !keys.includes('qubit')) {
        throw new Error('Invalid Input');
      }
      let newScript = `\nqc.h(${qrConfig.register}[${qrConfig.qubit}])`;
      let oldScript = globalContext.get('script');
      globalContext.set('script', oldScript + newScript);
      // pass the quantum register config to the output
      send(msg);
    })
  }

  RED.nodes.registerType('hadamard-gate', HadamardGate);
};
  