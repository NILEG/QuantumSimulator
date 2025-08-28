import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();

console.log("\n15. CONTROLLED PARAMETRIC GATES TESTS");
simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("random");

// Test CU gate
const cuTest = simulator.createCircuit("cu_test", 2, { c: 2 });
cuTest.x(0); // Control in |1⟩
cuTest.cu(Math.PI, Math.PI / 2, Math.PI / 4, 0, 1); // Arbitrary U gate parameters
cuTest.measureAll();

console.log("CU Circuit QASM:");
console.log(cuTest.toQASM());

result = cuTest.executeDeterministic();
console.log("CU Gate Test (theta=π, phi=π/2, lambda=π/4):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CRX gate
const crxTest = simulator.createCircuit("crx_test", 2, { c: 2 });
crxTest.x(0); // Control in |1⟩
crxTest.crx(Math.PI / 2, 0, 1); // 90-degree rotation around X
crxTest.measureAll();

console.log("CRX Circuit QASM:");
console.log(crxTest.toQASM());

result = crxTest.executeDeterministic();
console.log("\nCRX Gate Test (θ=π/2):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CRY gate
const cryTest = simulator.createCircuit("cry_test", 2, { c: 2 });
cryTest.x(0); // Control in |1⟩
cryTest.cry(Math.PI / 2, 0, 1); // 90-degree rotation around Y
cryTest.measureAll();

console.log("CRY Circuit QASM:");
console.log(cryTest.toQASM());

result = cryTest.executeDeterministic();
console.log("\nCRY Gate Test (θ=π/2):");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CRZ gate
const crzTest = simulator.createCircuit("crz_test", 2, { c: 2 });
crzTest.x(0); // Control in |1⟩
crzTest.h(1); // Target in superposition
crzTest.crz(Math.PI / 2, 0, 1); // 90-degree rotation around Z
crzTest.measureAll();

console.log("CRZ Circuit QASM:");
console.log(crzTest.toQASM());

result = crzTest.executeDeterministic();
console.log("\nCRZ Gate Test (φ=π/2) on superposition:");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});

// Test CP gate (Controlled Phase)
const cpTest = simulator.createCircuit("cp_test", 2, { c: 2 });
cpTest.x(0); // Control in |1⟩
cpTest.h(1); // Target in superposition
cpTest.cp(Math.PI / 4, 0, 1); // 45-degree phase
cpTest.measureAll();

console.log("CP Circuit QASM:");
console.log(cpTest.toQASM());

result = cpTest.executeDeterministic();
console.log("\nCP Gate Test (λ=π/4) on superposition:");
result.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: ${state.probability.toFixed(
        6
      )}, amplitude: ${state.amplitude.toString()}`
    );
  }
});
