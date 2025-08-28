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

console.log("\n3. COMPLEX CONDITIONAL LOGIC TEST");

const complexTest = simulator.createComplexConditionalTest();
console.log("\nGenerated QASM:");
console.log(complexTest.toQASM());

console.log("\nCircuit Visualization:");
console.log(complexTest.draw());

const result3 = complexTest.executeDeterministic();
console.log("\nExecution Results:");
console.log("Operation History:");
result3.operationHistory.forEach((op, index) => {
  const regStates = [];
  for (const [name, reg] of op.classicalStatesAfter) {
    regStates.push(`${name}=${reg.getRegisterValue()}`);
  }
  const conditionStr = op.operation.condition
    ? ` (${op.operation.condition.toString()})`
    : "";
  console.log(
    `  Step ${index}: ${
      op.operation.type
    }${conditionStr} - Condition satisfied: ${
      op.conditionSatisfied
    } - Classical: [${regStates.join(", ")}]`
  );
});

console.log("\nFinal Classical Register States:");
for (const [name, register] of result3.classicalRegisters) {
  console.log(
    `  ${name}: bits=${register.toString()}, value=${register.getRegisterValue()}`
  );
}
console.log("\nFinal Quantum State:");
result3.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `  ${state.state}: probability=${state.probability.toFixed(
        6
      )}, amplitude=${state.amplitude.toString()}`
    );
  }
});
