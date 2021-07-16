module.exports = function(RED) {
  'use strict';
  function MeasurementNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.selectedBit = config.selectedBit;
    this.selectedRegVarName = config.selectedRegVarName;
    const globalContext = this.context().global;
    const node = this;
    this.on('input', function(msg, send, done) {
      let oldScript = globalContext.get('script');
      let qiskitScript = `\nqc.measure(${msg.payload.register}[${msg.payload.qubit}], `;
      if (!node.selectedRegVarName) {
        qiskitScript += `${node.selectedRegVarName}[${node.selectedBit}])\n`;
      }
      else {
        qiskitScript += `${node.selectedBit})\n`;
      }
      oldScript = globalContext.get('script');
      globalContext.set('script', oldScript + qiskitScript);
      node.send(msg);
    });
  }

  RED.nodes.registerType('measurement', MeasurementNode);
};
