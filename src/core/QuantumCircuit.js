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
import { ClassicalRegister } from "../classical/ClassicalRegister.js";
import { c } from "../constants/QuantumConstants.js";
import { Qubit } from "./Qubit.js";
import { gateMatrices } from "../constants/QuantumConstants.js";
import { Gate } from "./Gate.js";
import { CircuitOperation } from "./CircuitOperation.js";
import { ClassicalCondition } from "../classical/ClassicalCondition.js";
import { ComplexNumber } from "../utils/ComplexNumber.js";
export class QuantumCircuit {
  constructor(
    numQubits,
    classicalRegisters = {},
    config = new SimulatorConfiguration()
  ) {
    this.numQubits = numQubits;
    this.classicalRegisters = new Map();

    // Handle classical registers - can be object or legacy number
    if (typeof classicalRegisters === "number") {
      // Legacy support: create default register 'c'
      this.classicalRegisters.set(
        "c",
        new ClassicalRegister("c", classicalRegisters)
      );
    } else if (typeof classicalRegisters === "object") {
      // New format: {registerName: size, ...}
      for (const [name, size] of Object.entries(classicalRegisters)) {
        this.classicalRegisters.set(name, new ClassicalRegister(name, size));
      }
    }

    // Ensure at least one classical register exists
    if (this.classicalRegisters.size === 0) {
      this.classicalRegisters.set("c", new ClassicalRegister("c", numQubits));
    }

    this.config = config.clone();
    this.qubits = Array.from({ length: numQubits }, () => new Qubit());
    this.operations = [];
    this.stateVector = this._initializeStateVector();
    this.name = "quantum_circuit";
  }

  // Add classical register
  addClassicalRegister(name, size) {
    this.classicalRegisters.set(name, new ClassicalRegister(name, size));
    return this;
  }

  // Get classical register
  getClassicalRegister(name) {
    return this.classicalRegisters.get(name);
  }

  // Get classical register value
  getClassicalValue(registerName) {
    const register = this.classicalRegisters.get(registerName);
    return register ? register.getRegisterValue() : 0;
  }

  _initializeStateVector() {
    let state = matrix([[c(1)], [c(0)]]);
    for (let i = 1; i < this.numQubits; i++) {
      state = kron(state, matrix([[c(1)], [c(0)]]));
    }
    return state;
  }

  // Enhanced measurement with proper classical register support
  measure(qubit, registerName = "c", bitIndex = null, condition = null) {
    const register = this.classicalRegisters.get(registerName);
    if (!register) {
      throw new Error(`Classical register '${registerName}' not found`);
    }

    const actualBitIndex = bitIndex !== null ? bitIndex : qubit;
    if (actualBitIndex >= register.size) {
      throw new Error(
        `Bit index ${actualBitIndex} out of range for register '${registerName}' (size ${register.size})`
      );
    }

    const operation = CircuitOperation.measurement(
      qubit,
      registerName,
      actualBitIndex,
      condition
    );
    this.operations.push(operation);

    // Apply measurement only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      const result = this._performMeasurement(qubit);
      register.setValue(actualBitIndex, result);
      return result;
    }

    return null;
  }
  // Reset
  reset(qubit, condition = null) {
    const operation = CircuitOperation.reset(qubit, condition);
    this.operations.push(operation);

    // Apply reset only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      this.qubits[qubit].reset();
      this._updateStateVectorAfterReset(qubit);
    }

    return this;
  }

  _updateStateVectorAfterReset(qubit) {
    // After reset, we need to update the state vector
    this.stateVector = this._initializeStateVector();

    // Reapply all operations except the reset
    const tempOperations = [...this.operations];
    this.operations = [];

    for (const op of tempOperations) {
      if (op.type !== "reset" && op.type !== "measurement") {
        if (op.type === "gate") {
          if (op.qubits.length === 1) {
            this._applyUnaryGate(op.gate, op.qubits[0]);
          } else if (op.qubits.length === 2) {
            this._applyBinaryGate(op.gate, op.qubits[0], op.qubits[1]);
          } else if (op.qubits.length === 3) {
            this._applyTernaryGate(
              op.gate,
              op.qubits[0],
              op.qubits[1],
              op.qubits[2]
            );
          } else if (op.qubits.length === 4) {
            this._applyQuaternaryGate(
              op.gate,
              op.qubits[0],
              op.qubits[1],
              op.qubits[2],
              op.qubits[3]
            );
          }
        }
      }
    }

    this.operations = tempOperations;
  }
  // Barrier
  barrier(qubits) {
    const qubitList = Array.isArray(qubits) ? qubits : [qubits];
    this.operations.push(CircuitOperation.barrier(qubitList));
    return this;
  }
  measureAll() {
    const results = [];
    for (let i = 0; i < this.numQubits && i < this.numClassicalBits; i++) {
      results.push(this.measure(i, i));
    }
    return results;
  }
  _performMeasurement(qubit) {
    const probs = this.getQubitProbabilities();
    const prob0 = probs[qubit][0];
    const prob1 = probs[qubit][1];

    let result;
    if (Math.abs(prob0 - prob1) < 1e-10) {
      // Equal probabilities
      switch (this.config.equalProbabilityCollapse) {
        case "0":
          result = 0;
          break;
        case "1":
          result = 1;
          break;
        case "random":
        default:
          result = Math.random() < 0.5 ? 0 : 1;
          break;
      }
    } else {
      result = prob0 > prob1 ? 0 : 1;
    }

    if (!this.config.measurementDeferred) {
      this._updateStateVectorAfterMeasurement(qubit, result);
    }

    return result;
  }

  _updateStateVectorAfterMeasurement(qubit, result) {
    const n = this.numQubits;
    const dim = Math.pow(2, n);
    let newStateVector = zeros(dim, 1);

    for (let i = 0; i < dim; i++) {
      const binaryI = i.toString(2).padStart(n, "0");
      const qubitState = parseInt(binaryI[n - 1 - qubit]);

      if (qubitState === result) {
        newStateVector.set([i, 0], this.stateVector.get([i, 0]));
      }
    }

    const norm = this._calculateNorm(newStateVector);
    if (norm > 1e-10) {
      this.stateVector = divide(newStateVector, norm);
    }
  }

  // Enhanced conditional methods
  ifEqual(registerName, value) {
    return {
      then: (callback) => {
        const condition = new ClassicalCondition(registerName, value, "==");
        callback(this, condition);
        return this;
      },
    };
  }

  ifNotEqual(registerName, value) {
    return {
      then: (callback) => {
        const condition = new ClassicalCondition(registerName, value, "!=");
        callback(this, condition);
        return this;
      },
    };
  }

  ifGreater(registerName, value) {
    return {
      then: (callback) => {
        const condition = new ClassicalCondition(registerName, value, ">");
        callback(this, condition);
        return this;
      },
    };
  }

  // Single qubit gates
  applyGate(gateName, qubit, parameters = [], condition = null) {
    let gate;

    if (gateMatrices[gateName]) {
      gate = new Gate(gateName, gateMatrices[gateName]);
    } else {
      switch (gateName.toUpperCase()) {
        case "U":
          gate = Gate.U(...parameters);
          break;
        case "U1":
          gate = Gate.U1(parameters[0]);
          break;
        case "U2":
          gate = Gate.U2(...parameters);
          break;
        case "U3":
          gate = Gate.U3(...parameters);
          break;
        case "RX":
          gate = Gate.RX(parameters[0]);
          break;
        case "RY":
          gate = Gate.RY(parameters[0]);
          break;
        case "RZ":
          gate = Gate.RZ(parameters[0]);
          break;
        case "P":
          gate = Gate.P(parameters[0]);
          break;
        default:
          throw new Error(`Unknown gate: ${gateName}`);
      }
    }

    const operation = new CircuitOperation(gate, [qubit], [], condition);
    this.operations.push(operation);

    // Apply gate only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      this._applyUnaryGate(gate, qubit);
    }

    return this;
  }

  applyTwoQubitGate(
    gateName,
    qubit1,
    qubit2,
    parameters = [],
    condition = null
  ) {
    let gate;

    switch (gateName.toUpperCase()) {
      case "CNOT":
      case "CX":
        gate = Gate.CNOT();
        break;
      case "CZ":
        gate = Gate.CZ();
        break;
      case "CY":
        gate = Gate.CY();
        break;
      case "CH":
        gate = Gate.CH();
        break;
      case "CS":
        gate = Gate.CS();
        break;
      case "CSDG":
        gate = Gate.CSDG();
        break;
      case "CT":
        gate = Gate.CT();
        break;
      case "CTDG":
        gate = Gate.CTDG();
        break;
      case "CSX":
        gate = Gate.CSX();
        break;
      case "CSXDG":
        gate = Gate.CSXDG();
        break;
      case "SWAP":
        gate = Gate.SWAP();
        break;
      case "RXX":
        gate = Gate.RXX(parameters[0]);
        break;
      case "RYY":
        gate = Gate.RYY(parameters[0]);
        break;
      case "RZZ":
        gate = Gate.RZZ(parameters[0]);
        break;
      case "CU":
        gate = Gate.CU(...parameters);
        break;
      case "CU1":
        gate = Gate.CU1(parameters[0]);
        break;
      case "CU2":
        gate = Gate.CU2(...parameters);
        break;
      case "CU3":
        gate = Gate.CU3(...parameters);
        break;
      case "CRX":
        gate = Gate.CRX(parameters[0]);
        break;
      case "CRY":
        gate = Gate.CRY(parameters[0]);
        break;
      case "CRZ":
        gate = Gate.CRZ(parameters[0]);
        break;
      case "CP":
        gate = Gate.CP(parameters[0]);
        break;
      default:
        throw new Error(`Unknown two-qubit gate: ${gateName}`);
    }

    const operation = new CircuitOperation(
      gate,
      [qubit1, qubit2],
      [],
      condition
    );
    this.operations.push(operation);

    // Apply gate only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      this._applyBinaryGate(gate, qubit1, qubit2);
    }

    return this;
  }

  // Three qubit gates
  applyThreeQubitGate(gateName, qubit1, qubit2, qubit3, condition = null) {
    let gate;

    switch (gateName.toUpperCase()) {
      case "CCX":
      case "TOFFOLI":
        gate = Gate.CCX();
        break;
      case "RCCX":
        gate = Gate.RCCX();
        break;
      case "FREDKIN":
      case "CSWAP":
        gate = Gate.FREDKIN();
        break;
      default:
        throw new Error(`Unknown three-qubit gate: ${gateName}`);
    }

    const operation = new CircuitOperation(
      gate,
      [qubit1, qubit2, qubit3],
      [],
      condition
    );
    this.operations.push(operation);

    // Apply gate only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      this._applyTernaryGate(gate, qubit1, qubit2, qubit3);
    }

    return this;
  }

  // Four qubit gates
  applyFourQubitGate(
    gateName,
    qubit1,
    qubit2,
    qubit3,
    qubit4,
    condition = null
  ) {
    let gate;

    switch (gateName.toUpperCase()) {
      case "CCCX":
      case "C3X":
        gate = Gate.CCCX();
        break;
      default:
        throw new Error(`Unknown four-qubit gate: ${gateName}`);
    }

    const operation = new CircuitOperation(
      gate,
      [qubit1, qubit2, qubit3, qubit4],
      [],
      condition
    );
    this.operations.push(operation);

    // Apply gate only if condition is satisfied
    if (operation.isConditionSatisfied(this.classicalRegisters)) {
      this._applyQuaternaryGate(gate, qubit1, qubit2, qubit3, qubit4);
    }

    return this;
  }

  // Specific gate methods with optional conditions
  x(qubit, condition = null) {
    return this.applyGate("X", qubit, [], condition);
  }
  y(qubit, condition = null) {
    return this.applyGate("Y", qubit, [], condition);
  }
  z(qubit, condition = null) {
    return this.applyGate("Z", qubit, [], condition);
  }
  h(qubit, condition = null) {
    return this.applyGate("H", qubit, [], condition);
  }
  s(qubit, condition = null) {
    return this.applyGate("S", qubit, [], condition);
  }
  sdg(qubit, condition = null) {
    return this.applyGate("SDG", qubit, [], condition);
  }
  t(qubit, condition = null) {
    return this.applyGate("T", qubit, [], condition);
  }
  tdg(qubit, condition = null) {
    return this.applyGate("TDG", qubit, [], condition);
  }
  sx(qubit, condition = null) {
    return this.applyGate("SX", qubit, [], condition);
  }
  sxdg(qubit, condition = null) {
    return this.applyGate("SXDG", qubit, [], condition);
  }

  // Parametric gates with optional conditions
  u(theta, phi, lambda, qubit, condition = null) {
    return this.applyGate("U", qubit, [theta, phi, lambda], condition);
  }
  u1(lambda, qubit, condition = null) {
    return this.applyGate("U1", qubit, [lambda], condition);
  }
  u2(phi, lambda, qubit, condition = null) {
    return this.applyGate("U2", qubit, [phi, lambda], condition);
  }
  u3(theta, phi, lambda, qubit, condition = null) {
    return this.applyGate("U3", qubit, [theta, phi, lambda], condition);
  }
  rx(theta, qubit, condition = null) {
    return this.applyGate("RX", qubit, [theta], condition);
  }
  ry(theta, qubit, condition = null) {
    return this.applyGate("RY", qubit, [theta], condition);
  }
  rz(phi, qubit, condition = null) {
    return this.applyGate("RZ", qubit, [phi], condition);
  }
  p(lambda, qubit, condition = null) {
    return this.applyGate("P", qubit, [lambda], condition);
  }

  // Two-qubit gates with optional conditions
  cnot(control, target, condition = null) {
    return this.applyTwoQubitGate("CNOT", control, target, [], condition);
  }
  cx(control, target, condition = null) {
    return this.cnot(control, target, condition);
  }
  cz(control, target, condition = null) {
    return this.applyTwoQubitGate("CZ", control, target, [], condition);
  }
  cy(control, target, condition = null) {
    return this.applyTwoQubitGate("CY", control, target, [], condition);
  }
  ch(control, target, condition = null) {
    return this.applyTwoQubitGate("CH", control, target, [], condition);
  }

  cs(control, target, condition = null) {
    return this.applyTwoQubitGate("CS", control, target, [], condition);
  }

  csdg(control, target, condition = null) {
    return this.applyTwoQubitGate("CSDG", control, target, [], condition);
  }

  ct(control, target, condition = null) {
    return this.applyTwoQubitGate("CT", control, target, [], condition);
  }

  ctdg(control, target, condition = null) {
    return this.applyTwoQubitGate("CTDG", control, target, [], condition);
  }

  csx(control, target, condition = null) {
    return this.applyTwoQubitGate("CSX", control, target, [], condition);
  }

  csxdg(control, target, condition = null) {
    return this.applyTwoQubitGate("CSXDG", control, target, [], condition);
  }

  // Controlled parametric gates
  cu(theta, phi, lambda, control, target, condition = null) {
    return this.applyTwoQubitGate(
      "CU",
      control,
      target,
      [theta, phi, lambda],
      condition
    );
  }

  cu1(lambda, control, target, condition = null) {
    return this.applyTwoQubitGate("CU1", control, target, [lambda], condition);
  }

  cu2(phi, lambda, control, target, condition = null) {
    return this.applyTwoQubitGate(
      "CU2",
      control,
      target,
      [phi, lambda],
      condition
    );
  }

  cu3(theta, phi, lambda, control, target, condition = null) {
    return this.applyTwoQubitGate(
      "CU3",
      control,
      target,
      [theta, phi, lambda],
      condition
    );
  }

  crx(theta, control, target, condition = null) {
    return this.applyTwoQubitGate("CRX", control, target, [theta], condition);
  }

  cry(theta, control, target, condition = null) {
    return this.applyTwoQubitGate("CRY", control, target, [theta], condition);
  }

  crz(phi, control, target, condition = null) {
    return this.applyTwoQubitGate("CRZ", control, target, [phi], condition);
  }

  cp(lambda, control, target, condition = null) {
    return this.applyTwoQubitGate("CP", control, target, [lambda], condition);
  }
  swap(qubit1, qubit2, condition = null) {
    return this.applyTwoQubitGate("SWAP", qubit1, qubit2, [], condition);
  }
  rxx(theta, qubit1, qubit2, condition = null) {
    return this.applyTwoQubitGate("RXX", qubit1, qubit2, [theta], condition);
  }
  ryy(theta, qubit1, qubit2, condition = null) {
    return this.applyTwoQubitGate("RYY", qubit1, qubit2, [theta], condition);
  }
  rzz(theta, qubit1, qubit2, condition = null) {
    return this.applyTwoQubitGate("RZZ", qubit1, qubit2, [theta], condition);
  }

  // Three-qubit gates with optional conditions
  ccx(control1, control2, target, condition = null) {
    return this.applyThreeQubitGate(
      "CCX",
      control1,
      control2,
      target,
      condition
    );
  }
  toffoli(control1, control2, target, condition = null) {
    return this.ccx(control1, control2, target, condition);
  }
  rccx(control1, control2, target, condition = null) {
    return this.applyThreeQubitGate(
      "RCCX",
      control1,
      control2,
      target,
      condition
    );
  }
  fredkin(control, target1, target2, condition = null) {
    return this.applyThreeQubitGate(
      "FREDKIN",
      control,
      target1,
      target2,
      condition
    );
  }
  cswap(control, target1, target2, condition = null) {
    return this.fredkin(control, target1, target2, condition);
  }

  // Four-qubit gates with optional conditions
  cccx(control1, control2, control3, target, condition = null) {
    return this.applyFourQubitGate(
      "CCCX",
      control1,
      control2,
      control3,
      target,
      condition
    );
  }
  c3x(control1, control2, control3, target, condition = null) {
    return this.cccx(control1, control2, control3, target, condition);
  }

  // Gate matrix expansion methods (keeping existing implementation)
  _expandGateMatrix(gateMatrix, targetQubit) {
    const n = this.numQubits;
    const dim = Math.pow(2, n);
    let result = zeros(dim, dim);

    const gate = Array.isArray(gateMatrix) ? matrix(gateMatrix) : gateMatrix;

    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const binaryI = i.toString(2).padStart(n, "0");
        const binaryJ = j.toString(2).padStart(n, "0");

        let match = true;
        for (let k = 0; k < n; k++) {
          if (k !== targetQubit && binaryI[n - 1 - k] !== binaryJ[n - 1 - k]) {
            match = false;
            break;
          }
        }

        if (match) {
          const targetStateI = parseInt(binaryI[n - 1 - targetQubit]);
          const targetStateJ = parseInt(binaryJ[n - 1 - targetQubit]);
          const gateElement = gate.get([targetStateI, targetStateJ]);
          result.set([i, j], gateElement);
        }
      }
    }

    return result;
  }

  _expandTwoQubitGateMatrix(gateMatrix, control, target) {
    const n = this.numQubits;
    const dim = Math.pow(2, n);
    let result = zeros(dim, dim);

    const gate = Array.isArray(gateMatrix) ? matrix(gateMatrix) : gateMatrix;

    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const binaryI = i.toString(2).padStart(n, "0");
        const binaryJ = j.toString(2).padStart(n, "0");

        let match = true;
        for (let k = 0; k < n; k++) {
          if (
            k !== control &&
            k !== target &&
            binaryI[n - 1 - k] !== binaryJ[n - 1 - k]
          ) {
            match = false;
            break;
          }
        }

        if (match) {
          const controlStateI = parseInt(binaryI[n - 1 - control]);
          const targetStateI = parseInt(binaryI[n - 1 - target]);
          const controlStateJ = parseInt(binaryJ[n - 1 - control]);
          const targetStateJ = parseInt(binaryJ[n - 1 - target]);

          const twoQubitStateI = controlStateI * 2 + targetStateI;
          const twoQubitStateJ = controlStateJ * 2 + targetStateJ;

          // FIXED: Swap the indices
          const gateElement = gate.get([twoQubitStateI, twoQubitStateJ]);
          result.set([i, j], gateElement);
        }
      }
    }

    return result;
  }

  _expandThreeQubitGateMatrix(gateMatrix, qubit1, qubit2, qubit3) {
    const n = this.numQubits;
    const dim = Math.pow(2, n);
    let result = zeros(dim, dim);

    const gate = Array.isArray(gateMatrix) ? matrix(gateMatrix) : gateMatrix;

    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const binaryI = i.toString(2).padStart(n, "0");
        const binaryJ = j.toString(2).padStart(n, "0");

        let match = true;
        for (let k = 0; k < n; k++) {
          if (
            k !== qubit1 &&
            k !== qubit2 &&
            k !== qubit3 &&
            binaryI[n - 1 - k] !== binaryJ[n - 1 - k]
          ) {
            match = false;
            break;
          }
        }

        if (match) {
          const state1I = parseInt(binaryI[n - 1 - qubit1]);
          const state2I = parseInt(binaryI[n - 1 - qubit2]);
          const state3I = parseInt(binaryI[n - 1 - qubit3]);
          const state1J = parseInt(binaryJ[n - 1 - qubit1]);
          const state2J = parseInt(binaryJ[n - 1 - qubit2]);
          const state3J = parseInt(binaryJ[n - 1 - qubit3]);

          const threeQubitStateI = state1I * 4 + state2I * 2 + state3I;
          const threeQubitStateJ = state1J * 4 + state2J * 2 + state3J;

          // FIXED: Swap the indices
          const gateElement = gate.get([threeQubitStateI, threeQubitStateJ]);
          result.set([i, j], gateElement);
        }
      }
    }

    return result;
  }

  _expandFourQubitGateMatrix(gateMatrix, qubit1, qubit2, qubit3, qubit4) {
    const n = this.numQubits;
    const dim = Math.pow(2, n);
    let result = zeros(dim, dim);

    const gate = Array.isArray(gateMatrix) ? matrix(gateMatrix) : gateMatrix;

    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const binaryI = i.toString(2).padStart(n, "0");
        const binaryJ = j.toString(2).padStart(n, "0");

        // Check if all other qubits are the same
        let match = true;
        for (let k = 0; k < n; k++) {
          if (
            k !== qubit1 &&
            k !== qubit2 &&
            k !== qubit3 &&
            k !== qubit4 &&
            binaryI[n - 1 - k] !== binaryJ[n - 1 - k]
          ) {
            match = false;
            break;
          }
        }

        if (match) {
          // Extract four qubit states
          const state1I = parseInt(binaryI[n - 1 - qubit1]);
          const state2I = parseInt(binaryI[n - 1 - qubit2]);
          const state3I = parseInt(binaryI[n - 1 - qubit3]);
          const state4I = parseInt(binaryI[n - 1 - qubit4]);
          const state1J = parseInt(binaryJ[n - 1 - qubit1]);
          const state2J = parseInt(binaryJ[n - 1 - qubit2]);
          const state3J = parseInt(binaryJ[n - 1 - qubit3]);
          const state4J = parseInt(binaryJ[n - 1 - qubit4]);

          // Create 4-qubit computational basis indices
          const fourQubitStateI =
            state1I * 8 + state2I * 4 + state3I * 2 + state4I;
          const fourQubitStateJ =
            state1J * 8 + state2J * 4 + state3J * 2 + state4J;

          // FIXED: Swap the indices
          const gateElement = gate.get([fourQubitStateI, fourQubitStateJ]);
          result.set([i, j], gateElement);
        }
      }
    }

    return result;
  }

  _applyUnaryGate(gate, qubit) {
    const gateMatrix = this._expandGateMatrix(gate.matrix, qubit);
    this.stateVector = multiply(gateMatrix, this.stateVector);
  }

  _applyBinaryGate(gate, qubit1, qubit2) {
    const gateMatrix = this._expandTwoQubitGateMatrix(
      gate.matrix,
      qubit1,
      qubit2
    );
    this.stateVector = multiply(gateMatrix, this.stateVector);
  }

  _applyTernaryGate(gate, qubit1, qubit2, qubit3) {
    const gateMatrix = this._expandThreeQubitGateMatrix(
      gate.matrix,
      qubit1,
      qubit2,
      qubit3
    );
    this.stateVector = multiply(gateMatrix, this.stateVector);
  }
  _applyQuaternaryGate(gate, qubit1, qubit2, qubit3, qubit4) {
    const gateMatrix = this._expandFourQubitGateMatrix(
      gate.matrix,
      qubit1,
      qubit2,
      qubit3,
      qubit4
    );
    this.stateVector = multiply(gateMatrix, this.stateVector);
  }

  // Analysis methods
  getStateVector() {
    return this.stateVector;
  }

  getStateProbabilities() {
    const stateArray = this.stateVector.toArray();
    const probabilities = [];

    for (let i = 0; i < stateArray.length; i++) {
      const amplitude = stateArray[i][0];
      const probability = abs(amplitude) ** 2;
      const binaryState = i.toString(2).padStart(this.numQubits, "0");
      probabilities.push({
        state: `|${binaryState}>`,
        amplitude: ComplexNumber.fromMathJS(amplitude),
        probability: probability,
      });
    }

    return probabilities;
  }

  getQubitProbabilities() {
    const stateArray = this.stateVector.toArray();
    const n = this.numQubits;

    const qubitProbabilities = Array.from({ length: n }, () => ({
      0: 0,
      1: 0,
    }));

    for (let i = 0; i < stateArray.length; i++) {
      const amplitude = stateArray[i][0];
      const probability = abs(amplitude) ** 2;

      // Convert to binary - MSB is leftmost
      const binaryState = i.toString(2).padStart(n, "0");

      // Map correctly: qubit j corresponds to bit position (n-1-j) in binary string
      for (let qubitIndex = 0; qubitIndex < n; qubitIndex++) {
        const bitValue = parseInt(binaryState[n - 1 - qubitIndex]);
        qubitProbabilities[qubitIndex][bitValue] += probability;
      }
    }

    return qubitProbabilities;
  }
  // Density matrix operations
  getDensityMatrix() {
    const ket = this.stateVector;
    const bra = transpose(conj(ket));
    return multiply(ket, bra);
  }

  _calculateNorm(vector) {
    const vectorArray = vector.toArray();
    let norm = 0;
    for (const row of vectorArray) {
      norm += abs(row[0]) ** 2;
    }
    return Math.sqrt(norm);
  }

  // Execute the circuit
  execute() {
    this.stateVector = this._initializeStateVector();

    // Reset all classical registers
    for (const register of this.classicalRegisters.values()) {
      register.bits.fill(0);
    }

    for (const operation of this.operations) {
      if (operation.isConditionSatisfied(this.classicalRegisters)) {
        if (operation.type === "gate") {
          if (operation.qubits.length === 1) {
            this._applyUnaryGate(operation.gate, operation.qubits[0]);
          } else if (operation.qubits.length === 2) {
            this._applyBinaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1]
            );
          } else if (operation.qubits.length === 3) {
            this._applyTernaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1],
              operation.qubits[2]
            );
          } else if (operation.qubits.length === 4) {
            this._applyQuaternaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1],
              operation.qubits[2],
              operation.qubits[3]
            );
          }
        } else if (operation.type === "measurement") {
          const qubit = operation.qubits[0];
          const classicalOp = operation.classicalOperations[0];
          const result = this._performMeasurement(qubit);
          const register = this.classicalRegisters.get(
            classicalOp.registerName
          );
          if (register) {
            register.setValue(classicalOp.bitIndex, result);
          }
          if (!this.config.measurementDeferred) {
            this._updateStateVectorAfterMeasurement(qubit, result);
          }
        } else if (operation.type === "reset") {
          this._deterministicReset(operation.qubits[0]);
        }
      }
    }

    return this;
  }
  // Deterministic reset operation
  _deterministicReset(qubit) {
    // Reset qubit to |0⟩ state deterministically
    const probs = this.getQubitProbabilities();
    const prob1 = probs[qubit][1];

    if (prob1 > 1e-10) {
      // If qubit has probability of being in |1⟩
      // Apply X gate with probability weighting to reset to |0⟩
      const resetOperator = this._createResetOperator(qubit);
      this.stateVector = multiply(resetOperator, this.stateVector);

      // Normalize the state
      const norm = this._calculateNorm(this.stateVector);
      this.stateVector = divide(this.stateVector, norm);
    }
  }

  _createResetOperator(qubit) {
    // Create a reset operator that projects qubit to |0⟩ state
    const dim = Math.pow(2, this.numQubits);
    const resetOp = zeros(dim, dim);

    for (let i = 0; i < dim; i++) {
      const binary = i.toString(2).padStart(this.numQubits, "0");
      if (binary[this.numQubits - 1 - qubit] === "0") {
        resetOp.set([i, i], c(1));

        // Also include the |1⟩ component projected to |0⟩
        const flippedBinary =
          binary.substring(0, this.numQubits - 1 - qubit) +
          "1" +
          binary.substring(this.numQubits - qubit);
        if (flippedBinary.length === this.numQubits) {
          const flippedIndex = parseInt(flippedBinary, 2);
          resetOp.set([i, flippedIndex], c(1));
        }
      }
    }

    return resetOp;
  }
  // Partial trace operations (FIXED)
  _partialTrace(rho, qubitIndex) {
    const size = Math.pow(2, this.numQubits);
    const reducedMatrix = zeros(2, 2);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const binaryI = i.toString(2).padStart(this.numQubits, "0");
        const binaryJ = j.toString(2).padStart(this.numQubits, "0");

        const otherBitsI =
          binaryI.slice(0, this.numQubits - 1 - qubitIndex) +
          binaryI.slice(this.numQubits - qubitIndex);
        const otherBitsJ =
          binaryJ.slice(0, this.numQubits - 1 - qubitIndex) +
          binaryJ.slice(this.numQubits - qubitIndex);

        if (otherBitsI === otherBitsJ) {
          const value = rho.get([i, j]);
          const row = binaryI[this.numQubits - 1 - qubitIndex] === "0" ? 0 : 1;
          const col = binaryJ[this.numQubits - 1 - qubitIndex] === "0" ? 0 : 1;
          reducedMatrix.set(
            [row, col],
            add(reducedMatrix.get([row, col]), value)
          );
        }
      }
    }

    return reducedMatrix;
  }

  // Partial trace over multiple qubits
  _partialTraceMultipleQubits(rho, qubitsToKeep) {
    let reducedRho = rho;
    const qubitsToTrace = [];

    for (let i = 0; i < this.numQubits; i++) {
      if (!qubitsToKeep.includes(i)) {
        qubitsToTrace.push(i);
      }
    }

    // Trace out qubits in reverse order to maintain indexing
    qubitsToTrace.sort((a, b) => b - a);

    for (const qubit of qubitsToTrace) {
      reducedRho = this._partialTrace(reducedRho, qubit);
    }

    return reducedRho;
  }
  // Deterministic execution with detailed tracking
  executeDeterministic() {
    this.stateVector = this._initializeStateVector();

    // Reset all classical registers
    for (const register of this.classicalRegisters.values()) {
      register.bits.fill(0);
    }

    const executionResults = {
      finalStateVector: null,
      finalProbabilities: null,
      measurementProbabilities: {},
      gateApplications: [],
      operationHistory: [],
      classicalRegisters: new Map(),
    };

    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      const conditionSatisfied = operation.isConditionSatisfied(
        this.classicalRegisters
      );

      const operationResult = {
        operation: operation,
        conditionSatisfied: conditionSatisfied,
        stateBefore: this._cloneMatrix(this.stateVector),
        stateAfter: null,
        probabilities: null,
        classicalStatesBefore: this._cloneClassicalRegisters(),
        classicalStatesAfter: null,
      };
      if (!conditionSatisfied) {
        operationResult.stateAfter = this._cloneMatrix(this.stateVector);
        operationResult.probabilities = this.getStateProbabilities();
        operationResult.classicalStatesAfter = this._cloneClassicalRegisters();
        executionResults.operationHistory.push(operationResult);
        continue;
      }

      if (conditionSatisfied) {
        if (operation.type === "gate") {
          if (operation.qubits.length === 1) {
            this._applyUnaryGate(operation.gate, operation.qubits[0]);
          } else if (operation.qubits.length === 2) {
            this._applyBinaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1]
            );
          } else if (operation.qubits.length === 3) {
            this._applyTernaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1],
              operation.qubits[2]
            );
          } else if (operation.qubits.length === 4) {
            this._applyQuaternaryGate(
              operation.gate,
              operation.qubits[0],
              operation.qubits[1],
              operation.qubits[2],
              operation.qubits[3]
            );
          }
          operationResult.stateAfter = this._cloneMatrix(this.stateVector);
          operationResult.probabilities = this.getStateProbabilities();
          executionResults.gateApplications.push({
            gate: operation.gate.name,
            qubits: operation.qubits,
            parameters: operation.gate.parameters,
            resultingProbabilities: operationResult.probabilities,
          });
        } else if (operation.type === "measurement") {
          const qubit = operation.qubits[0];
          const classicalOp = operation.classicalOperations[0];

          // Always calculate the measurement result based on probabilities
          const probs = this.getQubitProbabilities();
          const prob0 = probs[qubit][0];
          const prob1 = probs[qubit][1];

          let result;
          if (Math.abs(prob0 - prob1) < 1e-10) {
            switch (this.config.equalProbabilityCollapse) {
              case "0":
                result = 0;
                break;
              case "1":
                result = 1;
                break;
              case "random":
              default:
                result = Math.random() < 0.5 ? 0 : 1;
                break;
            }
          } else {
            result = prob0 > prob1 ? 0 : 1;
          }

          // Always update classical register
          const register = this.classicalRegisters.get(
            classicalOp.registerName
          );
          if (register) {
            register.setValue(classicalOp.bitIndex, result);
          }

          // Only collapse quantum state if not deferred
          if (!this.config.measurementDeferred) {
            this._updateStateVectorAfterMeasurement(qubit, result);
          }

          operationResult.stateAfter = this._cloneMatrix(this.stateVector);
          operationResult.probabilities = this.getStateProbabilities();
        } else if (operation.type === "reset") {
          this._deterministicReset(operation.qubits[0]);
          operationResult.stateAfter = this._cloneMatrix(this.stateVector);
          operationResult.probabilities = this.getStateProbabilities();
        }
      }

      operationResult.stateAfter = this._cloneMatrix(this.stateVector);
      operationResult.classicalStatesAfter = this._cloneClassicalRegisters();
      executionResults.operationHistory.push(operationResult);
    }

    executionResults.finalStateVector = this.stateVector;
    executionResults.finalProbabilities = this.getStateProbabilities();

    // Clone final classical register states
    for (const [name, register] of this.classicalRegisters) {
      executionResults.classicalRegisters.set(name, register.clone());
    }

    return executionResults;
  }
  // Deterministic measurement that returns probabilities without collapse
  measureDeterministic(qubit) {
    const qubitProbs = this.getQubitProbabilities();
    return {
      qubit: qubit,
      probability_0: qubitProbs[qubit][0],
      probability_1: qubitProbs[qubit][1],
      expectedValue: qubitProbs[qubit][1], // Expected value for |1⟩ state
      variance: qubitProbs[qubit][0] * qubitProbs[qubit][1],
    };
  }

  // Deterministic measurement of all qubits
  measureAllDeterministic() {
    const results = [];
    for (let i = 0; i < this.numQubits; i++) {
      results.push(this.measureDeterministic(i));
    }
    return results;
  }

  _cloneMatrix(mat) {
    return matrix(mat.toArray());
  }

  _cloneClassicalRegisters() {
    const cloned = new Map();
    for (const [name, register] of this.classicalRegisters) {
      cloned.set(name, register.clone());
    }
    return cloned;
  }
  // Simulation methods (keeping the original random simulation)
  simulate(shots = 1024) {
    const results = {};

    for (let shot = 0; shot < shots; shot++) {
      // Create a copy of the circuit for this shot
      const circuitCopy = this._createCopy();

      // Execute all operations
      for (const operation of circuitCopy.operations) {
        if (operation.type === "measurement") {
          const qubit = operation.qubits[0];
          const classicalBit = operation.classicalBits[0];
          if (operation.isConditionSatisfied(circuitCopy.classicalBits)) {
            circuitCopy.classicalBits[classicalBit] =
              circuitCopy._simulateMeasurement(qubit);
          }
        }
      }

      // Record the result
      const resultString = circuitCopy.classicalBits.join("");
      results[resultString] = (results[resultString] || 0) + 1;
    }

    return results;
  }

  _createCopy() {
    const copy = new QuantumCircuit(
      this.numQubits,
      this.numClassicalBits,
      this.config
    );
    copy.stateVector = this.stateVector;
    copy.operations = [...this.operations];
    copy.classicalBits = [...this.classicalBits];
    return copy;
  }

  _simulateMeasurement(qubit) {
    const probs = this.getQubitProbabilities();
    const prob0 = probs[qubit][0];
    return Math.random() < prob0 ? 0 : 1;
  }

  // Get measurement counts
  getCounts(shots = 1024) {
    return this.simulate(shots);
  }
  // Get circuit depth
  getDepth() {
    return this.operations.length;
  }

  // Get circuit width
  getWidth() {
    return this.numQubits;
  }

  // Count gates by type
  getGateCount() {
    const counts = {};
    for (const operation of this.operations) {
      if (operation.type === "gate") {
        const gateName = operation.gate.name;
        counts[gateName] = (counts[gateName] || 0) + 1;
      }
    }
    return counts;
  }

  // OpenQASM Generation with proper classical register support
  toQASM() {
    let qasm = "OPENQASM 2.0;\n";
    qasm += 'include "qelib1.inc";\n\n';
    qasm += `qreg q[${this.numQubits}];\n`;

    // Output all classical registers
    for (const [name, register] of this.classicalRegisters) {
      qasm += `creg ${name}[${register.size}];\n`;
    }

    qasm += "\n";

    for (const operation of this.operations) {
      qasm += operation.toQASM() + "\n";
    }

    return qasm;
  }

  // Circuit visualization
  draw() {
    const lines = Array(this.numQubits)
      .fill(null)
      .map((_, i) => `q[${i}] |0⟩─`);

    for (const operation of this.operations) {
      this._addOperationToVisualization(lines, operation);
    }

    // Add classical register status
    const classicalInfo = [];
    for (const [name, register] of this.classicalRegisters) {
      classicalInfo.push(
        `${name}[${
          register.size
        }] = ${register.toString()} (${register.getRegisterValue()})`
      );
    }

    return (
      lines.join("\n") + "\n\nClassical Registers:\n" + classicalInfo.join("\n")
    );
  }

  _addOperationToVisualization(lines, operation) {
    let prefix = "";
    if (operation.condition) {
      prefix = `[${operation.condition.toString()}]`;
    }

    switch (operation.type) {
      case "gate":
        if (operation.qubits.length === 1) {
          const qubit = operation.qubits[0];
          lines[qubit] += `─${prefix}[${operation.gate.name}]─`;
        } else if (operation.qubits.length === 2) {
          const [q1, q2] = operation.qubits;
          if (
            operation.gate.name === "CNOT" ||
            operation.gate.name.startsWith("C")
          ) {
            lines[q1] += `─${prefix}●─`;
            lines[q2] += `─${prefix}⊕─`;
          } else {
            lines[q1] += `─${prefix}[${operation.gate.name}]─`;
            lines[q2] += `─${prefix}[${operation.gate.name}]─`;
          }
        } else if (operation.qubits.length === 3) {
          const [q1, q2, q3] = operation.qubits;
          if (operation.gate.name === "FREDKIN") {
            lines[q1] += `─${prefix}●─`;
            lines[q2] += `─${prefix}×─`;
            lines[q3] += `─${prefix}×─`;
          } else {
            lines[q1] += `─${prefix}●─`;
            lines[q2] += `─${prefix}●─`;
            lines[q3] += `─${prefix}⊕─`;
          }
        } else if (operation.qubits.length === 4) {
          const [q1, q2, q3, q4] = operation.qubits;
          lines[q1] += `─${prefix}●─`;
          lines[q2] += `─${prefix}●─`;
          lines[q3] += `─${prefix}●─`;
          lines[q4] += `─${prefix}⊕─`;
        }
        break;
      case "measurement":
        const qubit = operation.qubits[0];
        const classicalOp = operation.classicalOperations[0];
        lines[
          qubit
        ] += `─${prefix}[M→${classicalOp.registerName}[${classicalOp.bitIndex}]]─`;
        break;
      case "reset":
        const resetQubit = operation.qubits[0];
        lines[resetQubit] += `─${prefix}[R]─`;
        break;
      case "barrier":
        for (const qubit of operation.qubits) {
          lines[qubit] += "─║─";
        }
        break;
    }

    // Pad all lines to the same length
    const maxLength = Math.max(...lines.map((line) => line.length));
    lines.forEach((line, index) => {
      while (lines[index].length < maxLength) {
        lines[index] += "─";
      }
    });
  }
}
