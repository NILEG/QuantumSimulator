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
import { QuantumSimulator } from "quanta-quantum-simulator";

// Create a quantum simulator
const simulator = new QuantumSimulator();

// Create a simple Bell state circuit
const bellCircuit = simulator.createCircuit("bell_state", 2, { c: 2 });
bellCircuit.h(0); // Apply Hadamard to qubit 0
bellCircuit.cnot(0, 1); // Apply CNOT with control=0, target=1
bellCircuit.measureAll(); // Measure all qubits

// Execute the circuit
const result = bellCircuit.executeDeterministic();
console.log(result.finalProbabilities);
```
