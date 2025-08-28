import {
  complex,
  multiply,
  kron,
  transpose,
  conj,
  matrix,
  zeros,
  add,
  trace,
  divide,
  re,
  im,
  abs,
} from "mathjs";

// Import the class first
import { QuantumSimulator } from "./core/QuantumSimulator.js";

// All your named exports
export { QuantumSimulator } from "./core/QuantumSimulator.js";
export { QuantumCircuit } from "./core/QuantumCircuit.js";
export { Qubit } from "./core/Qubit.js";
export { Gate } from "./core/Gate.js";
export { CircuitOperation } from "./core/CircuitOperation.js";
export { ClassicalRegister } from "./classical/ClassicalRegister.js";
export { ClassicalCondition } from "./classical/ClassicalCondition.js";
export { SimulatorConfiguration } from "./config/SimulatorConfiguration.js";
export { ComplexNumber } from "./utils/ComplexNumber.js";
export { gateMatrices, quantumStates } from "./constants/QuantumConstants.js";

export const version = "1.0.0";

// Default export - this is the key fix
export default QuantumSimulator;
