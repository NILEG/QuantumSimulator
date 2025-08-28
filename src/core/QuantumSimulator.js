class QuantumSimulator {
  constructor() {
    this.circuits = new Map();
    this.currentCircuit = null;
    this.config = new SimulatorConfiguration();
  }

  configure() {
    return this.config;
  }

  setConfiguration(config) {
    this.config = config.clone();
    return this;
  }

  createCircuit(name, numQubits, classicalRegisters = {}) {
    const circuit = new QuantumCircuit(
      numQubits,
      classicalRegisters,
      this.config
    );
    circuit.name = name;
    this.circuits.set(name, circuit);
    this.currentCircuit = circuit;
    return circuit;
  }

  getCircuit(name) {
    return this.circuits.get(name);
  }
  removeCircuit(name) {
    this.circuits.delete(name);
    if (this.currentCircuit && this.currentCircuit.name === name) {
      this.currentCircuit = null;
    }
  }
  // Utility methods for creating common quantum algorithms
  createBellState(circuitName = "bell_state") {
    const circuit = this.createCircuit(circuitName, 2, 2);
    circuit.h(0);
    circuit.cnot(0, 1);
    return circuit;
  }

  createGHZState(numQubits, circuitName = "ghz_state") {
    const circuit = this.createCircuit(circuitName, numQubits, numQubits);
    circuit.h(0);
    for (let i = 1; i < numQubits; i++) {
      circuit.cnot(0, i);
    }
    return circuit;
  }

  // Enhanced QFT implementation
  createQuantumFourierTransform(numQubits, circuitName = "qft") {
    const circuit = this.createCircuit(circuitName, numQubits);

    for (let j = 0; j < numQubits; j++) {
      circuit.h(j);

      for (let k = j + 1; k < numQubits; k++) {
        const angle = Math.PI / Math.pow(2, k - j);

        // Controlled phase rotation
        circuit.cnot(k, j);
        circuit.p(-angle / 2, j);
        circuit.cnot(k, j);
        circuit.p(angle / 2, j);
        circuit.p(angle / 2, k);
      }
    }

    // Swap qubits to reverse the order
    for (let i = 0; i < Math.floor(numQubits / 2); i++) {
      circuit.swap(i, numQubits - 1 - i);
    }

    return circuit;
  }

  createMultiQubitTestCircuit(circuitName = "multi_qubit_test") {
    const circuit = this.createCircuit(circuitName, 4, 4);

    // Create superposition
    circuit.h(0);
    circuit.h(1);

    // Two-qubit entanglement
    circuit.cnot(0, 2);
    circuit.cz(1, 3);

    // Three-qubit gates
    circuit.ccx(0, 1, 2);
    circuit.fredkin(0, 2, 3);

    // Four-qubit gate
    circuit.cccx(0, 1, 2, 3);

    // Parametric gates
    circuit.rxx(Math.PI / 4, 0, 1);
    circuit.ryy(Math.PI / 6, 1, 2);
    circuit.rzz(Math.PI / 3, 2, 3);

    return circuit;
  }
  // Create OPENQASM Example 1 equivalent
  createOpenQASMExample1() {
    const circuit = this.createCircuit("example1", 3, { c: 3 });

    circuit.x(0);
    circuit.measure(0, "c", 1); // measure q[0] -> c[1]

    circuit.ifEqual("c", 2).then((c, condition) => {
      c.x(0, condition); // if (c == 2) x q[0]
    });

    return circuit;
  }

  // Create OPENQASM Example 2 equivalent
  createOpenQASMExample2() {
    const circuit = this.createCircuit("example2", 3, { c: 3, c0: 4 });

    circuit.x(0);
    circuit.x(1);
    circuit.measure(0, "c", 1); // measure q[0] -> c[1]

    circuit.ifEqual("c", 3).then((c, condition) => {
      c.x(0, condition); // if (c == 3) x q[0]
    });

    circuit.measure(1, "c0", 3); // measure q[1] -> c0[3]

    circuit.ifEqual("c0", 8).then((c, condition) => {
      c.x(1, condition); // if (c0 == 8) x q[1]
    });

    return circuit;
  }

  // Test complex conditional logic
  createComplexConditionalTest() {
    const circuit = this.createCircuit("complex_test", 4, { c: 4, status: 2 });

    // Create some initial state
    circuit.h(0);
    circuit.cnot(0, 1);
    circuit.x(2);

    // Measurements
    circuit.measure(0, "c", 0);
    circuit.measure(1, "c", 1);
    circuit.measure(2, "status", 0);

    // Complex conditionals
    circuit.ifEqual("c", 3).then((c, condition) => {
      // if c == 011 (3)
      c.x(3, condition);
    });

    circuit.ifEqual("status", 1).then((c, condition) => {
      // if status == 01 (1)
      c.h(3, condition);
    });

    circuit.ifEqual("c", 0).then((c, condition) => {
      // if c != 0
      c.z(2, condition);
    });

    return circuit;
  }

  listCircuits() {
    return Array.from(this.circuits.keys());
  }

  setCurrentCircuit(name) {
    const circuit = this.circuits.get(name);
    if (circuit) {
      this.currentCircuit = circuit;
      return circuit;
    }
    throw new Error(`Circuit '${name}' not found`);
  }

  getCurrentCircuit() {
    return this.currentCircuit;
  }
}
