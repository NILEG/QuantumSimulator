import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";
// Initialize the quantum simulator
const simulator = new QuantumSimulator();

console.log("11. CONTROLLED HADAMARD (CH) GATE TEST");
simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("1");
const chTest = simulator.createCircuit("ch_test", 2, { c: 2 });

// Test with control in |0⟩ state (no effect)
chTest.ch(0, 1);
chTest.measureAll();
console.log("CH Circuit QASM:");
console.log(chTest.toQASM());

let result = chTest.executeDeterministic();
console.log("Control |0⟩, Target |0⟩:");
console.log("Final probabilities:");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${
        state.state
      }: amplitude ${state.amplitude.toString()} probability ${state.probability.toFixed(
        6
      )}`
    );
  }
});

// Test with control in |1⟩ state (Hadamard applied to target)
const chTest2 = simulator.createCircuit("ch_test2", 2, { c: 2 });
chTest2.x(0); // Set control to |1⟩
chTest2.ch(0, 1); // Apply CH gate
chTest2.measureAll();
console.log("\nCH Circuit with control set to |1⟩ QASM:");
console.log(chTest2.toQASM());

result = chTest2.executeDeterministic();
console.log(
  "\nControl |1⟩, Target |0⟩ (should create superposition on target):"
);
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`  ${state.state}: ${state.probability.toFixed(6)}`);
  }
});
