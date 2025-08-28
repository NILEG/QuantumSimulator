import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

/*
gate cs a, b {
    cu1(pi/2) a, b;
}

// controlled-Sdg
gate csdg a, b {
    cu1(-pi/2) a, b;
}
*/

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");
console.log("\n12. CONTROLLED S (CS) AND S† (CSDG) GATE TESTS");

// Test CS gate
const csTest = simulator.createCircuit("cs_test", 2, { c: 2 });
csTest.x(0); // Control in |1⟩
csTest.h(1); // Target in superposition
csTest.cs(0, 1);
csTest.measureAll();
console.log("CS Circuit QASM:");
console.log(csTest.toQASM());

result = csTest.executeDeterministic();
console.log("CS Gate Test (Control |1⟩, Target in superposition):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CS followed by CSDG (should cancel out)
const csCsdgTest = simulator.createCircuit("cs_csdg_test", 2, { c: 2 });
csCsdgTest.x(0); // Control in |1⟩
csCsdgTest.h(1); // Target in superposition
csCsdgTest.cs(0, 1);
csCsdgTest.csdg(0, 1);
csCsdgTest.measureAll();
console.log("\nCS followed by CSDG Circuit QASM:");
console.log(csCsdgTest.toQASM());

result = csCsdgTest.executeDeterministic();
console.log("\nCS followed by CSDG Test (should cancel out):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});
