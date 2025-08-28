export class Qubit {
  constructor(initialState = "|0>") {
    this.state = matrix(quantumStates[initialState]);
    this.measured = false;
    this.measurementResult = null;
  }

  reset() {
    this.state = matrix(quantumStates["|0>"]);
    this.measured = false;
    this.measurementResult = null;
  }

  getStateVector() {
    return this.state;
  }

  getProbabilities() {
    const stateArray = this.state.toArray();
    return {
      "|0>": abs(stateArray[0][0]) ** 2,
      "|1>": abs(stateArray[1][0]) ** 2,
    };
  }

  measure(config = new SimulatorConfiguration()) {
    if (this.measured && !config.measurementDeferred)
      return this.measurementResult;

    const probs = this.getProbabilities();
    const prob0 = probs["|0>"];
    const prob1 = probs["|1>"];

    let result;
    if (!config.measurementDeferred) {
      // Collapse the state based on probabilities
      if (Math.abs(prob0 - prob1) < 1e-10) {
        // Equal probabilities
        switch (config.equalProbabilityCollapse) {
          case "0":
            result = 0;
            break;
          case "1":
            result = 1;
            break;
          case "random":
          default:
            result = Math.random() < 0.5 ? 0 : 1;
            break;
        }
      } else {
        // Choose the state with higher probability
        result = prob0 > prob1 ? 0 : 1;
      }

      // Collapse the state
      this.measurementResult = result;
      this.state = matrix(
        result === 0 ? quantumStates["|0>"] : quantumStates["|1>"]
      );
      this.measured = true;
    } else {
      // Deferred measurement - don't collapse
      const random = Math.random();
      result = random < prob0 ? 0 : 1;
    }

    return result;
  }
}
