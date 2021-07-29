module.exports = function(RED) {
  'use strict';

  function IBMQuantumSystemNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const apiKey = config.api_key;
    const preferredProvider = config.preferred_provider;
    const preferredBackend = config.preferred_backend;

    let ibmqScript = `
       provider = IBMQ.enable_account(${apiKey})
       backend_service = IBMQ.least_busy(provider.backends())
       job = execute(qc, backend=backend_service)
       job.result()`;

    // Scripts dependent on if user wants default machines for their account or to specify another set of parameters.
    // if (preferred_provider == "" && preferred_backend == "") {
    //   ibmqScript = `provider = IBMQ.enable_account(${api_key})
    //   backend_service = provider.service('backend')
    //   job = execute(qc, backend=backend_service)
    //   results = job.result()`;
    // } else if (preferred_provider != "" && preferred_backend == "") {
    //   ibmqScript = `provider = IBMQ.get_provider(${preferred_provider})
    //   backend_service = IBMQ.least_busy(provider.backends())
    //   job = execute(qc, backend=backend_service)
    //   results = job.result()`;
    // } else {
    //   ibmqScript = `provider = IBMQ.get_provider(${preferred_provider})
    //   backend_service = IBMQ.get_backend(${preferred_backend})
    //   job = execute(qc, backend=backend_service)
    //   results = job.result()`;
    // }

    shell.execute(ibmqScript, (err, data) => {
      if (err) {
        node.error(err, msg);
      } else {
        msg.payload = data;
        send(msg);
      }
    });
  }
  RED.nodes.registerType('ibm-quantum-system', IBMQuantumSystemNode);
};
