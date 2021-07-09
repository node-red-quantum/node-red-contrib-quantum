module.exports = function(RED) {
  'use strict';
  function MeasurementNode(config) {
    RED.nodes.createNode(this, config);
    measurementNode = this;
    this.name = config.name;
    this.cbitindex = config.cbitindex;
    this.selectedCbit = config.selectedCbit;
    this.selectedCreg = config.selectedCreg;
    const globalContext = this.context().global;
    const node = this;

    this.on('input', function(msg, send, done) {
      let oldScript = globalContext.get('script');
      let qiskitScript = `\nqc.measure(${msg.payload.register}[${msg.payload.qubit}], `;
      qiskitScript += `${node.selectedCreg}[${node.selectedCbit}])\n`;
      oldScript = globalContext.get('script');
      globalContext.set('script', oldScript + qiskitScript);
      node.send(msg);
    });
  }

  RED.nodes.registerType('measurement', MeasurementNode);
};
