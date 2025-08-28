import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();

simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");
console.log("\n6. THREE-QUBIT CIRCUIT TEST");
const threeQubitCircuit = simulator.createCircuit("three_qubit_test", 3, {
  c: 3,
});
threeQubitCircuit.h(0);
threeQubitCircuit.cnot(0, 1);
threeQubitCircuit.rz(Math.PI / 3, 2);
threeQubitCircuit.ccx(0, 1, 2);

// Add measurements if desired
threeQubitCircuit.measure(0, "c", 0);
threeQubitCircuit.measure(1, "c", 1);
threeQubitCircuit.measure(2, "c", 2);

const threeQubitResult = threeQubitCircuit.executeDeterministic();
console.log("Three-Qubit Circuit QASM:");
console.log(threeQubitCircuit.toQASM());

console.log("\nThree-Qubit Final State Amplitudes:");
threeQubitResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `${state.state}: probability=${state.probability.toFixed(
        6
      )}, amplitude=${state.amplitude.toString()}`
    );
  }
});

console.log("Final classical registers:");
console.log(
  "Register c:",
  threeQubitCircuit.getClassicalRegister("c").toString(),
  "Value:",
  threeQubitCircuit.getClassicalValue("c")
);
