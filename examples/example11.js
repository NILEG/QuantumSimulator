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

console.log("\n10. RESET OPERATIONS TEST");
const resetCircuit = simulator.createCircuit("reset_test", 2, { c: 2 });
const condition = new ClassicalCondition("c", 1, "==");
resetCircuit.h(0, condition);
resetCircuit.cnot(0, 1);
resetCircuit.measure(0, "c", 0);
resetCircuit.reset(0);
resetCircuit.x(0);
resetCircuit.measure(0, "c", 1);
resetCircuit.measure(1, "c", 1); // This should overwrite c[1]

console.log("Reset Circuit QASM:");
console.log(resetCircuit.toQASM());

const resetResult = resetCircuit.executeDeterministic();
console.log("\nReset Circuit Results:");
console.log(
  "Register c:",
  resetCircuit.getClassicalRegister("c").toString(),
  "Value:",
  resetCircuit.getClassicalValue("c")
);

resetResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(`${state.state}: ${state.probability.toFixed(6)}`);
  }
});
