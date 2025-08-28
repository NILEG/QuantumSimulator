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

console.log("\n8. COMPREHENSIVE GATE TEST");
const comprehensiveCircuit = simulator.createCircuit("comprehensive_test", 4, {
  c: 4,
});

// Apply various single-qubit gates
comprehensiveCircuit.h(0);
comprehensiveCircuit.x(1);
comprehensiveCircuit.y(2);
comprehensiveCircuit.z(3);
comprehensiveCircuit.s(0);
comprehensiveCircuit.t(1);
comprehensiveCircuit.rx(Math.PI / 4, 2);
comprehensiveCircuit.ry(Math.PI / 3, 3);
comprehensiveCircuit.rz(Math.PI / 2, 0);

// Apply two-qubit gates
comprehensiveCircuit.cnot(0, 1);
comprehensiveCircuit.cz(1, 2);
comprehensiveCircuit.swap(2, 3);

// Apply three-qubit gate
comprehensiveCircuit.ccx(0, 1, 2);

// Add measurements
comprehensiveCircuit.measure(0, "c", 0);
comprehensiveCircuit.measure(1, "c", 1);
comprehensiveCircuit.measure(2, "c", 2);
comprehensiveCircuit.measure(3, "c", 3);

console.log("Comprehensive Circuit QASM:");
console.log(comprehensiveCircuit.toQASM());

const comprehensiveResult = comprehensiveCircuit.executeDeterministic();
console.log("\nComprehensive Circuit - Non-zero Probability States:");
comprehensiveResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `${state.state}: ${state.probability.toFixed(
        6
      )} (${state.amplitude.toString()})`
    );
  }
});

console.log("Final classical registers:");
console.log(
  "Register c:",
  comprehensiveCircuit.getClassicalRegister("c").toString(),
  "Value:",
  comprehensiveCircuit.getClassicalValue("c")
);
