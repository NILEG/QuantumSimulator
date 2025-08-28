import { complex } from "mathjs";

export const c = (real, imag = 0) => complex(real, imag);

export const quantumStates = {
  "|0>": [[c(1)], [c(0)]],
  "|1>": [[c(0)], [c(1)]],
  "|+>": [[c(1 / Math.sqrt(2))], [c(1 / Math.sqrt(2))]],
  "|->": [[c(1 / Math.sqrt(2))], [c(-1 / Math.sqrt(2))]],
  "|i>": [[c(1 / Math.sqrt(2))], [c(0, 1 / Math.sqrt(2))]],
  "|-i>": [[c(1 / Math.sqrt(2))], [c(0, -1 / Math.sqrt(2))]],
};

export const gateMatrices = {
  // Pauli Gates
  X: [
    [c(0), c(1)],
    [c(1), c(0)],
  ],
  Y: [
    [c(0), c(0, -1)],
    [c(0, 1), c(0)],
  ],
  Z: [
    [c(1), c(0)],
    [c(0), c(-1)],
  ],

  // Hadamard
  H: [
    [c(1 / Math.sqrt(2)), c(1 / Math.sqrt(2))],
    [c(1 / Math.sqrt(2)), c(-1 / Math.sqrt(2))],
  ],

  // Identity
  I: [
    [c(1), c(0)],
    [c(0), c(1)],
  ],

  // Phase Gates (FIXED)
  S: [
    [c(1), c(0)],
    [c(0), c(0, 1)],
  ],
  SDG: [
    [c(1), c(0)],
    [c(0), c(0, -1)],
  ],
  T: [
    [c(1), c(0)],
    [c(0), c(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))],
  ],
  TDG: [
    [c(1), c(0)],
    [c(0), c(Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4))],
  ],

  // Square root of X (FIXED)
  SX: [
    [c(0.5, 0.5), c(0.5, -0.5)],
    [c(0.5, -0.5), c(0.5, 0.5)],
  ],
  SXDG: [
    [c(0.5, -0.5), c(0.5, 0.5)],
    [c(0.5, 0.5), c(0.5, -0.5)],
  ],
};
