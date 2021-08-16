class State {
  constructor() {
    this.state = {};
    this.runtimeState = {};
    this.persistentState = {};
  }

  get(key) {
    return this.state[key];
  }

  del(key) {
    delete this.state[key];
    delete this.runtimeState[key];
    delete this.persistentState[key];
  }

  setRuntime(key, value) {
    this.runtimeState[key] = value;
    this.state[key] = value;
  }

  setPersistent(key, value) {
    this.persistentState[key] = value;
    this.state[key] = value;
  }

  reset() {
    this.state = {};
    this.runtimeState = {};
    this.persistentState = {};
  }

  resetRuntime() {
    for (let prop in this.runtimeState) {
      if (this.runtimeState.hasOwnProperty(prop)) {
        delete this.state[prop];
      }
    }
    this.runtimeState = {};
  }

  resetPersistent() {
    for (let prop in this.persistentState) {
      if (this.persistentState.hasOwnProperty(prop)) {
        delete this.state[prop];
      }
    }
    this.persistentState = {};
  }
}

module.exports.GlobalState = {};
module.exports.State = State;

