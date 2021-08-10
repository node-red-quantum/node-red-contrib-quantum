class GlobalState {
  constructor() {
    this.state = {};
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }
}

module.exports.GlobalState = new GlobalState();
