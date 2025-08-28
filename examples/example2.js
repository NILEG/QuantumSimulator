import {
  QuantumSimulator,
  SimulatorConfiguration,
  ClassicalCondition,
} from "quanta_sim";
const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");
console.log("\n2. OPENQASM EXAMPLE 2 TEST");
console.log("Recreating example with multiple classical registers");

const example2 = simulator.createOpenQASMExample2();
console.log("\nGenerated QASM:");
console.log(example2.toQASM());

console.log("\nCircuit Visualization:");
console.log(example2.draw());

const result2 = example2.executeDeterministic();
console.log("\nExecution Results:");
console.log("Operation History:");
result2.operationHistory.forEach((op, index) => {
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
for (const [name, register] of result2.classicalRegisters) {
  console.log(
    `  ${name}: bits=${register.toString()}, value=${register.getRegisterValue()}`
  );
}

console.log("\nFinal Quantum State:");
result2.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: probability=${state.probability.toFixed(
        6
      )}, amplitude=${state.amplitude.toString()}`
    );
  }
});
