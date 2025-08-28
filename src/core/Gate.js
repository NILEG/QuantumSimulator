export class Gate {
  constructor(name, matrix, parameters = [], qubits = []) {
    this.name = name;
    this.matrix = matrix;
    this.parameters = parameters;
    this.qubits = qubits;
    this.isParametric = parameters.length > 0;
    this.isControlled = false;
    this.controlQubits = [];
    this.targetQubits = [];
  }

  // Parametric gate constructors (FIXED)
  static U(theta, phi, lambda) {
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [
        c(cosTheta2),
        multiply(c(-sinTheta2), c(Math.cos(lambda), Math.sin(lambda))),
      ],
      [
        multiply(c(sinTheta2), c(Math.cos(phi), Math.sin(phi))),
        multiply(
          c(cosTheta2),
          c(Math.cos(phi + lambda), Math.sin(phi + lambda))
        ),
      ],
    ];

    return new Gate("U", matrix, [theta, phi, lambda]);
  }

  static U1(lambda) {
    return Gate.P(lambda); // U1 is equivalent to P gate
  }

  static U2(phi, lambda) {
    return Gate.U(Math.PI / 2, phi, lambda);
  }

  static U3(theta, phi, lambda) {
    return Gate.U(theta, phi, lambda);
  }

  static RX(theta) {
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [c(cosTheta2), c(0, -sinTheta2)],
      [c(0, -sinTheta2), c(cosTheta2)],
    ];

    return new Gate("RX", matrix, [theta]);
  }

  static RY(theta) {
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [c(cosTheta2), c(-sinTheta2)],
      [c(sinTheta2), c(cosTheta2)],
    ];

    return new Gate("RY", matrix, [theta]);
  }

  static RZ(phi) {
    const matrix = [
      [c(Math.cos(-phi / 2), Math.sin(-phi / 2)), c(0)],
      [c(0), c(Math.cos(phi / 2), Math.sin(phi / 2))],
    ];

    return new Gate("RZ", matrix, [phi]);
  }

  static P(lambda) {
    const matrix = [
      [c(1), c(0)],
      [c(0), c(Math.cos(lambda), Math.sin(lambda))],
    ];

    return new Gate("P", matrix, [lambda]);
  }

  // Two-qubit parametric gates (FIXED)
  static RXX(theta) {
    const cos = Math.cos(theta / 2);
    const sin = Math.sin(theta / 2);

    const matrix = [
      [c(cos), c(0), c(0), c(0, -sin)],
      [c(0), c(cos), c(0, -sin), c(0)],
      [c(0), c(0, -sin), c(cos), c(0)],
      [c(0, -sin), c(0), c(0), c(cos)],
    ];

    return new Gate("RXX", matrix, [theta]);
  }

  static RYY(theta) {
    const cos = Math.cos(theta / 2);
    const sin = Math.sin(theta / 2);

    const matrix = [
      [c(cos), c(0), c(0), c(0, sin)],
      [c(0), c(cos), c(0, -sin), c(0)],
      [c(0), c(0, -sin), c(cos), c(0)],
      [c(0, sin), c(0), c(0), c(cos)],
    ];

    return new Gate("RYY", matrix, [theta]);
  }

  static RZZ(theta) {
    const matrix = [
      [c(Math.cos(-theta / 2), Math.sin(-theta / 2)), c(0), c(0), c(0)],
      [c(0), c(Math.cos(theta / 2), Math.sin(theta / 2)), c(0), c(0)],
      [c(0), c(0), c(Math.cos(theta / 2), Math.sin(theta / 2)), c(0)],
      [c(0), c(0), c(0), c(Math.cos(-theta / 2), Math.sin(-theta / 2))],
    ];

    return new Gate("RZZ", matrix, [theta]);
  }

  // Standard controlled gates
  static CNOT() {
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0), c(1)],
      [c(0), c(0), c(1), c(0)],
    ];
    const gate = new Gate("CNOT", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CZ() {
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(-1)],
    ];
    const gate = new Gate("CZ", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CY() {
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0), c(0, -1)],
      [c(0), c(0), c(0, 1), c(0)],
    ];
    const gate = new Gate("CY", matrix);
    gate.isControlled = true;
    return gate;
  }
  static CH() {
    // Controlled Hadamard
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1 / Math.sqrt(2)), c(1 / Math.sqrt(2))],
      [c(0), c(0), c(1 / Math.sqrt(2)), c(-1 / Math.sqrt(2))],
    ];
    const gate = new Gate("CH", matrix);
    gate.isControlled = true;
    return gate;
  }
  static CS() {
    // Controlled S gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(0, 1)],
    ];
    const gate = new Gate("CS", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CSDG() {
    // Controlled S dagger gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(0, -1)],
    ];
    const gate = new Gate("CSDG", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CT() {
    // Controlled T gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))],
    ];
    const gate = new Gate("CT", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CTDG() {
    // Controlled T dagger gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4))],
    ];
    const gate = new Gate("CTDG", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CSX() {
    // Controlled sqrt(X) gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0.5, 0.5), c(0.5, -0.5)],
      [c(0), c(0), c(0.5, -0.5), c(0.5, 0.5)],
    ];
    const gate = new Gate("CSX", matrix);
    gate.isControlled = true;
    return gate;
  }

  static CSXDG() {
    // Controlled sqrt(X) dagger gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0.5, -0.5), c(0.5, 0.5)],
      [c(0), c(0), c(0.5, 0.5), c(0.5, -0.5)],
    ];
    const gate = new Gate("CSXDG", matrix);
    gate.isControlled = true;
    return gate;
  }

  // Controlled parametric gates
  static CU(theta, phi, lambda) {
    // Controlled U gate
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [
        c(0),
        c(0),
        c(cosTheta2),
        multiply(c(-sinTheta2), c(Math.cos(lambda), Math.sin(lambda))),
      ],
      [
        c(0),
        c(0),
        multiply(c(sinTheta2), c(Math.cos(phi), Math.sin(phi))),
        multiply(
          c(cosTheta2),
          c(Math.cos(phi + lambda), Math.sin(phi + lambda))
        ),
      ],
    ];

    const gate = new Gate("CU", matrix, [theta, phi, lambda]);
    gate.isControlled = true;
    return gate;
  }

  static CU1(lambda) {
    // Controlled U1 gate (same as CP)
    return Gate.CP(lambda);
  }

  static CU2(phi, lambda) {
    // Controlled U2 gate
    return Gate.CU(Math.PI / 2, phi, lambda);
  }

  static CU3(theta, phi, lambda) {
    // Controlled U3 gate
    return Gate.CU(theta, phi, lambda);
  }

  static CRX(theta) {
    // Controlled RX gate
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(cosTheta2), c(0, -sinTheta2)],
      [c(0), c(0), c(0, -sinTheta2), c(cosTheta2)],
    ];

    const gate = new Gate("CRX", matrix, [theta]);
    gate.isControlled = true;
    return gate;
  }

  static CRY(theta) {
    // Controlled RY gate
    const cosTheta2 = Math.cos(theta / 2);
    const sinTheta2 = Math.sin(theta / 2);

    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(cosTheta2), c(-sinTheta2)],
      [c(0), c(0), c(sinTheta2), c(cosTheta2)],
    ];

    const gate = new Gate("CRY", matrix, [theta]);
    gate.isControlled = true;
    return gate;
  }

  static CRZ(phi) {
    // Controlled RZ gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(Math.cos(-phi / 2), Math.sin(-phi / 2)), c(0)],
      [c(0), c(0), c(0), c(Math.cos(phi / 2), Math.sin(phi / 2))],
    ];

    const gate = new Gate("CRZ", matrix, [phi]);
    gate.isControlled = true;
    return gate;
  }

  static CP(lambda) {
    // Controlled Phase gate
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(Math.cos(lambda), Math.sin(lambda))],
    ];

    const gate = new Gate("CP", matrix, [lambda]);
    gate.isControlled = true;
    return gate;
  }

  static SWAP() {
    const matrix = [
      [c(1), c(0), c(0), c(0)],
      [c(0), c(0), c(1), c(0)],
      [c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0), c(1)],
    ];
    return new Gate("SWAP", matrix);
  }

  static CCX() {
    const matrix = [
      [c(1), c(0), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(1), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(1), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(1), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(0), c(1)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(1), c(0)],
    ];
    const gate = new Gate("CCX", matrix);
    gate.isControlled = true;
    return gate;
  }

  static RCCX() {
    const matrix = [
      [c(1), c(0), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(1), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(1), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(1), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(-1), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(0), c(1)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(1), c(0)],
    ];
    const gate = new Gate("RCCX", matrix);
    gate.isControlled = true;
    return gate;
  }

  // Four-qubit gates
  static CCCX() {
    const dim = 16;
    const matrix = Array(dim)
      .fill()
      .map(() => Array(dim).fill(c(0)));

    // Identity for all states except |1111⟩
    for (let i = 0; i < dim - 2; i++) {
      matrix[i][i] = c(1);
    }

    // Swap the last two states: |1110⟩ ↔ |1111⟩
    matrix[14][15] = c(1); // |1110⟩ -> |1111⟩
    matrix[15][14] = c(1); // |1111⟩ -> |1110⟩

    const gate = new Gate("CCCX", matrix);
    gate.isControlled = true;
    return gate;
  }

  static FREDKIN() {
    const matrix = [
      [c(1), c(0), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(1), c(0), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(1), c(0), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(1), c(0), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(1), c(0), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(1), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(1), c(0), c(0)],
      [c(0), c(0), c(0), c(0), c(0), c(0), c(0), c(1)],
    ];
    const gate = new Gate("FREDKIN", matrix);
    gate.isControlled = true;
    return gate;
  }
}
