import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

/*
gate ct a, b {
    cu1(pi/4) a, b;
}

gate ctdg a, b {
    cu1(-pi/4) a, b;
}
*/
console.log("\n13. CONTROLLED T (CT) AND T† (CTDG) GATE TESTS");
// Initialize the quantum simulator
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");
const ctTest = simulator.createCircuit("ct_test", 2, { c: 2 });
ctTest.x(0); // Control in |1⟩
ctTest.h(1); // Target in superposition
ctTest.ct(0, 1);
ctTest.measureAll();
console.log("CT Circuit QASM:");
console.log(ctTest.toQASM());

result = ctTest.executeDeterministic();
console.log("CT Gate Test (Control |1⟩, Target in superposition):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CT followed by CTDG (should cancel out)
const ctCtdgTest = simulator.createCircuit("ct_ctdg_test", 2, { c: 2 });
ctCtdgTest.x(0); // Control in |1⟩
ctCtdgTest.h(1); // Target in superposition
ctCtdgTest.ct(0, 1);
ctCtdgTest.ctdg(0, 1);
ctCtdgTest.measureAll();

console.log("CTDG Circuit QASM:");
console.log(ctCtdgTest.toQASM());

result = ctCtdgTest.executeDeterministic();
console.log("\nCT followed by CTDG Test (should cancel out):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});
