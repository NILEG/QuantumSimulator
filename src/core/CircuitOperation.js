export class CircuitOperation {
  constructor(gate, qubits, classicalOperations = [], condition = null) {
    this.gate = gate;
    this.qubits = qubits;
    this.classicalOperations = classicalOperations; // Array of {registerName, bitIndex} for measurements
    this.condition = condition; // ClassicalCondition object
    this.type = "gate";
  }

  static measurement(qubit, registerName, bitIndex, condition = null) {
    const op = new CircuitOperation(
      null,
      [qubit],
      [{ registerName, bitIndex }],
      condition
    );
    op.type = "measurement";
    return op;
  }

  static reset(qubit, condition = null) {
    const op = new CircuitOperation(null, [qubit], [], condition);
    op.type = "reset";
    return op;
  }

  static barrier(qubits) {
    const op = new CircuitOperation(null, qubits);
    op.type = "barrier";
    return op;
  }

  // Set classical condition using new ClassicalCondition
  setCondition(registerName, value, operator = "==") {
    this.condition = new ClassicalCondition(registerName, value, operator);
    return this;
  }

  // Check if condition is satisfied using new ClassicalRegister system
  isConditionSatisfied(registers) {
    if (!this.condition) return true;

    return this.condition.evaluate(registers);
  }

  toQASM() {
    let conditionStr = "";
    if (this.condition) {
      conditionStr = `if (${this.condition.toString()}) `;
    }

    switch (this.type) {
      case "gate":
        return conditionStr + this._gateToQASM();
      case "measurement":
        const op = this.classicalOperations[0];
        return (
          conditionStr +
          `measure q[${this.qubits[0]}] -> ${op.registerName}[${op.bitIndex}];`
        );
      case "reset":
        return conditionStr + `reset q[${this.qubits[0]}];`;
      case "barrier":
        return `barrier ${this.qubits.map((q) => `q[${q}]`).join(", ")};`;
      default:
        return "";
    }
  }

  _gateToQASM() {
    const gateName = this.gate.name.toLowerCase();

    // Handle special QASM gate names
    let qasmGateName = gateName;
    if (gateName === "cnot") qasmGateName = "cx";
    if (gateName === "ccx") qasmGateName = "ccx";
    if (gateName === "cccx") qasmGateName = "c3x";
    if (gateName === "sdg") qasmGateName = "sdg";
    if (gateName === "tdg") qasmGateName = "tdg";
    if (gateName === "fredkin") qasmGateName = "cswap";

    const params =
      this.gate.parameters.length > 0
        ? `(${this.gate.parameters.join(", ")})`
        : "";
    const qubits = this.qubits.map((q) => `q[${q}]`).join(", ");

    return `${qasmGateName}${params} ${qubits};`;
  }
}
