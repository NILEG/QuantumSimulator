export class SimulatorConfiguration {
  constructor() {
    this.measurementDeferred = false;
    this.equalProbabilityCollapse = "random"; // 'random', '0', '1'
  }

  setMeasurementDeferred(deferred) {
    this.measurementDeferred = deferred;
    return this;
  }

  setEqualProbabilityCollapse(strategy) {
    if (!["random", "0", "1"].includes(strategy)) {
      throw new Error(
        "Equal probability collapse must be 'random', '0', or '1'"
      );
    }
    this.equalProbabilityCollapse = strategy;
    return this;
  }

  clone() {
    const config = new SimulatorConfiguration();
    config.measurementDeferred = this.measurementDeferred;
    config.equalProbabilityCollapse = this.equalProbabilityCollapse;
    return config;
  }
}
