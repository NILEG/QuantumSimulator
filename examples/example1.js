import { QuantumSimulator } from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

console.log("1. OPENQASM EXAMPLE 1 TEST");
console.log("Recreating: x q[0]; measure q[0] -> c[1]; if (c == 2) x q[0];");

const example1 = simulator.createOpenQASMExample1();
console.log("\nGenerated QASM:");
console.log(example1.toQASM());

console.log("\nCircuit Visualization:");
console.log(example1.draw());

const result1 = example1.executeDeterministic();
console.log("\nExecution Results:");
console.log("Operation History:");
result1.operationHistory.forEach((op, index) => {
  const regStates = [];
  for (const [name, reg] of op.classicalStatesAfter) {
    regStates.push(`${name}=${reg.getRegisterValue()}`);
  }
  console.log(
    `  Step ${index}: ${op.operation.type} - Condition satisfied: ${
      op.conditionSatisfied
    } - Classical: [${regStates.join(", ")}]`
  );
});

console.log("\nFinal Classical Register States:");
for (const [name, register] of result1.classicalRegisters) {
  console.log(
    `  ${name}: bits=${register.toString()}, value=${register.getRegisterValue()}`
  );
}
console.log("\nFinal Quantum State:");
result1.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: probability=${state.probability.toFixed(
        6
      )}, amplitude=${state.amplitude.toString()}`
    );
  }
});
