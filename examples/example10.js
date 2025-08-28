import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

console.log("\n9. CONDITIONAL OPERATIONS TEST");
const conditionalCircuit = simulator.createCircuit("conditional_test", 3, {
  c: 3,
  status: 2,
});

// Set up initial state
conditionalCircuit.h(0);
conditionalCircuit.x(1);
conditionalCircuit.measure(0, "c", 0);
conditionalCircuit.measure(1, "c", 1);

// Conditional operations
conditionalCircuit.ifEqual("c", 3).then((circuit, condition) => {
  circuit.x(2, condition);
});

conditionalCircuit.ifEqual("c", 2).then((circuit, condition) => {
  circuit.h(2, condition);
});

conditionalCircuit.measure(2, "status", 0);

console.log("Conditional Circuit QASM:");
console.log(conditionalCircuit.toQASM());

const conditionalResult = conditionalCircuit.executeDeterministic();
console.log("\nConditional Circuit Results:");
console.log(
  "Register c:",
  conditionalCircuit.getClassicalRegister("c").toString(),
  "Value:",
  conditionalCircuit.getClassicalValue("c")
);
console.log(
  "Register status:",
  conditionalCircuit.getClassicalRegister("status").toString(),
  "Value:",
  conditionalCircuit.getClassicalValue("status")
);

conditionalResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`${state.state}: ${state.probability.toFixed(6)}`);
  }
});

console.log("\nCircuit Visualization:");
console.log(conditionalCircuit.draw());
