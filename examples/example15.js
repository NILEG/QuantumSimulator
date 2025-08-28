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

console.log("\n14. CONTROLLED SX (CSX) AND SX† (CSXDG) GATE TESTS");

const csxTest = simulator.createCircuit("csx_test", 2, { c: 2 });
csxTest.x(0); // Control in |1⟩
csxTest.csx(0, 1);
csxTest.measureAll();
console.log("CSX Circuit QASM:");
console.log(csxTest.toQASM());

result = csxTest.executeDeterministic();
console.log("CSX Gate Test (Control |1⟩, Target |0⟩):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CSX applied twice (should be like CX)
const csxTwiceTest = simulator.createCircuit("csx_twice_test", 2, { c: 2 });
csxTwiceTest.x(0); // Control in |1⟩
csxTwiceTest.csx(0, 1);
csxTwiceTest.csx(0, 1);
csxTwiceTest.measureAll();

console.log("CSX Circuit QASM:");
console.log(csxTwiceTest.toQASM());

result = csxTwiceTest.executeDeterministic();
console.log("\nCSX Gate Applied Twice (should be like CX):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`  ${state.state}: ${state.probability.toFixed(6)}`);
  }
});
