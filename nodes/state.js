class State {
  constructor() {
    this.state = {};
    this.runtimeState = {};
    this.persistentState = {};
  }

  /**
   * Get a value from the state.
   *
   * @param {string} key The key of the value to get.
   * @return {any} The value of the key.
  */
  get(key) {
    return this.state[key];
  }

  /**
   * Remove a value from the state
   *
   * @param {string} key The key of the value to remove.
  */
  del(key) {
    delete this.state[key];
    delete this.runtimeState[key];
    delete this.persistentState[key];
  }

  /**
   * Set a runtime value in the state.
   *
   * Runtime values are those which are only set whilst a node is being executed
   * via its input listener.
   *
   * @param {string} key The key of the value to set.
   * @param {any} value The value to set.
  */
  setRuntime(key, value) {
    this.runtimeState[key] = value;
    this.state[key] = value;
  }

  /**
   * Set a persistent value in the state.
   *
   * Persistent values are those which are only set whilst a node is being deployed,
   * either when Node-RED starts up or when the user manually deploys the flow.
   *
   * @param {string} key The key of the value to set.
   * @param {any} value The value to set.
  */
  setPersistent(key, value) {
    this.persistentState[key] = value;
    this.state[key] = value;
  }

  /**
   * Reset the state and remove all values.
  */
  reset() {
    this.state = {};
    this.runtimeState = {};
    this.persistentState = {};
  }

  /**
   * Reset the runtime state and remove all runtime values.
  */
  resetRuntime() {
    for (let prop in this.runtimeState) {
      if (this.runtimeState.hasOwnProperty(prop)) {
        delete this.state[prop];
      }
    }
    this.runtimeState = {};
  }

  /**
   * Reset the persistent state and remove all persistent values.
  */
  resetPersistent() {
    for (let prop in this.persistentState) {
      if (this.persistentState.hasOwnProperty(prop)) {
        delete this.state[prop];
      }
    }
    this.persistentState = {};
  }
}

class StateManager {
  constructor() {
    this.globalState = {};
  }

  /**
   * Create a new state for a given quantum circuit.
   *
   * If the state already exists for the circuit specified by the id, a new state
   * is not created and the existing state is returned.
   *
   * @param {string} id The id of the quantum circuit.
   * @return {State} The state object of the quantum circuit.
  */
  newState(id) {
    if (!this.globalState.hasOwnProperty(id)) {
      this.globalState[id] = new State();
    }
    return this.globalState[id];
  }

  /**
   * Get the state for a given quantum circuit.
   *
   * @param {string} id The id of the quantum circuit.
   * @return {State} The state object of the quantum circuit.
  */
  getState(id) {
    return this.globalState[id];
  }
}

module.exports.StateManager = new StateManager();
