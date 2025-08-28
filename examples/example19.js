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

console.log("\n18. IDENTITY TESTS (CANCELING GATES)");

// Test S and S† cancellation
const identityTest1 = simulator.createCircuit("identity_s", 2, { c: 2 });
identityTest1.x(0); // Control in |1⟩
identityTest1.h(1); // Target in superposition
identityTest1.cs(0, 1);
identityTest1.csdg(0, 1);
identityTest1.measureAll();

console.log("QASM");
console.log(identityTest1.toQASM());

result = identityTest1.executeDeterministic();
console.log("CS followed by CSDG (should be identity):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test T and T† cancellation (4 T gates = identity)
const identityTest2 = simulator.createCircuit("identity_t", 2, { c: 2 });
identityTest2.x(0); // Control in |1⟩
identityTest2.h(1); // Target in superposition
identityTest2.ct(0, 1);
identityTest2.ct(0, 1);
identityTest2.ct(0, 1);
identityTest2.ct(0, 1); // 4 T gates should equal identity
identityTest2.measureAll();

console.log("QASM");
console.log(identityTest2.toQASM());

result = identityTest2.executeDeterministic();
console.log("\nFour CT gates (should be identity):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});
