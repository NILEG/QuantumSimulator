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

console.log("\n17. MULTI-CONTROLLED GATES COMPOSITION TEST");

const multiControlledTest = simulator.createCircuit("multi_controlled", 4, {
  c: 4,
});

// Create entangled state
multiControlledTest.h(0);
multiControlledTest.cnot(0, 1);

// Apply various controlled gates
multiControlledTest.ch(0, 2); // Controlled Hadamard
multiControlledTest.cs(1, 3); // Controlled S
multiControlledTest.cry(Math.PI / 4, 2, 3); // Controlled RY

multiControlledTest.measureAll();
console.log("QASM");
console.log(multiControlledTest.toQASM());

result = multiControlledTest.executeDeterministic();
console.log("Multi-Controlled Gates Composition:");
console.log("Final probabilities:");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});
