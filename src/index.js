// Core Classes
export { QuantumSimulator } from "./core/QuantumSimulator.js";
export { QuantumCircuit } from "./core/QuantumCircuit.js";
export { Qubit } from "./core/Qubit.js";
export { Gate } from "./core/Gate.js";
export { CircuitOperation } from "./core/CircuitOperation.js";

// Classical Computing Support
export { ClassicalRegister } from "./classical/ClassicalRegister.js";
export { ClassicalCondition } from "./classical/ClassicalCondition.js";

// Configuration
export { SimulatorConfiguration } from "./config/SimulatorConfiguration.js";

// Utilities
export { ComplexNumber } from "./utils/ComplexNumber.js";

// Constants
export { gateMatrices, quantumStates } from "./constants/QuantumConstants.js";

// Algorithms (optional - for pre-built quantum algorithms)
export { QuantumAlgorithms } from "./algorithms/QuantumAlgorithms.js";

// Version information
export const version = "1.0.0";

// Default export for convenience
export default QuantumSimulator;
