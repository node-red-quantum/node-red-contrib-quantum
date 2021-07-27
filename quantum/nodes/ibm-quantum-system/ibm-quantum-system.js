module.exports = function (RED) {
  "use strict";

  function IBMQuantumSystemNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const api_key = config.api_key;

    //Script for is user decided to use default provider and backend for their account.
    let ibmqScript = `provider = IBMQ.enable_account(${api_key})
    backend_service = provider.service('backend')
    job = execute(qc, backend=backend_service)
    results = job.result()`;

    await shell.execute(ibmqScript, (err, data) => {
      if (err) {
        node.error(err, msg);
      } else {
        msg.payload = data;
        send(msg);
      }
    });
  }
  RED.nodes.registerType("ibm-quantum-system", IBMQuantumSystemNode);
};
