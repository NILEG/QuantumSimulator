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

console.log("\n7. CORRECTED QUANTUM FOURIER TRANSFORM TEST");

// Create QFT circuit manually to have control over classical registers
const qftCircuit = simulator.createCircuit("corrected_qft", 3, { c: 3 });

// Prepare initial state |001⟩ (qubit 2 in |1⟩ state)
qftCircuit.x(2);

// Apply QFT manually
for (let j = 0; j < 3; j++) {
  qftCircuit.h(j);

  for (let k = j + 1; k < 3; k++) {
    const angle = Math.PI / Math.pow(2, k - j);

    // Controlled phase rotation using available gates
    qftCircuit.cnot(k, j);
    qftCircuit.p(-angle / 2, j);
    qftCircuit.cnot(k, j);
    qftCircuit.p(angle / 2, j);
    qftCircuit.p(angle / 2, k);
  }
}

// Swap qubits to reverse the order
qftCircuit.swap(0, 2);

console.log("QFT Circuit QASM (starting from |001⟩):");
console.log(qftCircuit.toQASM());

const qftResult = qftCircuit.executeDeterministic();
console.log("\nQFT Final State Analysis:");
qftResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    const amplitude = state.amplitude;
    const phase = ((amplitude.phase() * 180) / Math.PI).toFixed(2);
    console.log(
      `${state.state}: prob=${state.probability.toFixed(
        6
      )}, amplitude=${amplitude.toString()}, phase=${phase}°`
    );
  }
});
console.log("\nQFT Circuit Visualization:");
console.log(qftCircuit.draw());
