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

console.log("\n16. CONTROLLED GATES WITH CLASSICAL CONDITIONS");

const conditionalControlledTest = simulator.createCircuit(
  "conditional_controlled",
  3,
  { c: 3, aux: 1 }
);

// Set up initial state
conditionalControlledTest.x(0); // First qubit to |1⟩
conditionalControlledTest.h(1); // Second qubit in superposition
conditionalControlledTest.measure(0, "c", 0); // Measure first qubit

// Apply controlled gate based on measurement result
conditionalControlledTest.ifEqual("c", 1).then((circuit, condition) => {
  circuit.ch(1, 2, condition); // Apply CH if measurement was 1
});

conditionalControlledTest.measureAll();

console.log("QASM");
console.log(conditionalControlledTest.toQASM());

result = conditionalControlledTest.executeDeterministic();
console.log("Controlled Gate with Classical Condition Test:");
console.log("Operation History:");
result.operationHistory.forEach((op, index) => {
  if (op.operation.type === "gate") {
    console.log(
      `  Step ${index}: ${op.operation.gate.name} gate - Condition satisfied: ${op.conditionSatisfied}`
    );
  } else {
    console.log(
      `  Step ${index}: ${op.operation.type} - Condition satisfied: ${op.conditionSatisfied}`
    );
  }
});

console.log("\nFinal probabilities:");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${
        state.state
      }: ${state.amplitude.toString()} ${state.probability.toFixed(6)}`
    );
  }
});
