import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();

console.log("\n4. DEFERRED vs NON-DEFERRED MEASUREMENTS");

// Non-deferred measurement (default)
const nonDeferredConfig = new SimulatorConfiguration()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

simulator.setConfiguration(nonDeferredConfig);
const nonDeferredCircuit = simulator.createCircuit("non_deferred", 2, { c: 2 });
nonDeferredCircuit.h(0);
nonDeferredCircuit.cnot(0, 1);
nonDeferredCircuit.measure(0, "c", 0); // measure q[0] -> c[0]
nonDeferredCircuit.measure(1, "c", 1); // measure q[1] -> c[1]

console.log("Non-deferred measurement circuit QASM:");
console.log(nonDeferredCircuit.toQASM());

console.log("Non-deferred measurement circuit:");
const nonDeferredResult = nonDeferredCircuit.executeDeterministic();
console.log("Final classical registers:");
console.log(
  "Register c:",
  nonDeferredCircuit.getClassicalRegister("c").toString(),
  "Value:",
  nonDeferredCircuit.getClassicalValue("c")
);
console.log("Final state probabilities:");
nonDeferredResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`  ${state.state}: ${state.probability.toFixed(6)}`);
  }
});

// Deferred measurement
const deferredConfig = new SimulatorConfiguration().setMeasurementDeferred(
  true
);

simulator.setConfiguration(deferredConfig);
const deferredCircuit = simulator.createCircuit("deferred", 2, { c: 2 });
deferredCircuit.h(0);
deferredCircuit.cnot(0, 1);
deferredCircuit.measure(0, "c", 0); // measure q[0] -> c[0]
deferredCircuit.measure(1, "c", 1); // measure q[1] -> c[1]

console.log("\nDeferred measurement circuit QASM:");
console.log(deferredCircuit.toQASM());

console.log("\nDeferred measurement circuit:");
const deferredResult = deferredCircuit.executeDeterministic();
console.log("Final classical registers:");
console.log(
  "Register c:",
  deferredCircuit.getClassicalRegister("c").toString(),
  "Value:",
  deferredCircuit.getClassicalValue("c")
);
console.log("Final state probabilities (should maintain superposition):");
deferredResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`  ${state.state}: ${state.probability.toFixed(6)}`);
  }
});
