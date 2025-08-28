import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";

/*
Paste This Code in the IBM COmposer as the RYY Gate doesn't exsist by default
// RYY(theta) gate definition in OpenQASM
gate ryy(theta) a, b {
    sdg a;
    sdg b;
    h a;
    h b;
    rzz(theta) a, b;
    h a;
    h b;
    s a;
    s b;
}


*/

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

console.log("\n5. MULTI-QUBIT GATE TESTS");

const multiQubitCircuit = simulator.createMultiQubitTestCircuit("multi_qubit");
console.log("Multi-qubit circuit QASM:");
console.log(multiQubitCircuit.toQASM());
console.log("\nMulti-qubit circuit visualization:");
console.log(multiQubitCircuit.draw());

const multiQubitResult = multiQubitCircuit.executeDeterministic();
console.log("\nMulti-qubit circuit final state:");
multiQubitResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${
        state.state
      }: amplitude ${state.amplitude.toString()} probability ${state.probability.toFixed(
        6
      )} (phase: ${state.amplitude.phase().toFixed(3)})`
    );
  }
});
