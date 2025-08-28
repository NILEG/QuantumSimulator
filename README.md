# Quanta - Quantum Computing Simulator

A comprehensive quantum computing simulator library with support for quantum circuits, gates, measurements, and classical conditional operations.

## Features

- 🔬 Complete quantum circuit simulation
- 🚪 Comprehensive quantum gate library
- 📊 State vector and measurement operations
- 🔀 Classical registers and conditional operations
- 📱 Browser and Node.js compatible

## Quick Start

```javascript
import { QuantumSimulator } from "quanta_sim";

const simulator = new QuantumSimulator();
const configuration = simulator
  .configure()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

const phaseCircuit = simulator.createCircuit("phase_test", 2, { c: 2 });
phaseCircuit.h(0);
phaseCircuit.s(0); // S gate
phaseCircuit.t(1); // T gate
phaseCircuit.p(Math.PI / 6, 0); // Custom phase gate

// Add measurements to see final classical state
phaseCircuit.measure(0, "c", 0);
phaseCircuit.measure(1, "c", 1);

console.log("Phase Gates QASM:");
console.log(phaseCircuit.toQASM());

const phaseResult = phaseCircuit.executeDeterministic();
console.log("\nPhase Circuit Final Probabilities:");
phaseResult.finalProbabilities.forEach((state) => {
  if (state.probability > 1e-10) {
    console.log(
      `${state.state}: ${state.probability.toFixed(
        6
      )} (amplitude: ${state.amplitude.toString()})`
    );
  }
});

console.log("Final classical registers:");
console.log(
  "Register c:",
  phaseCircuit.getClassicalRegister("c").toString(),
  "Value:",
  phaseCircuit.getClassicalValue("c")
);
```
