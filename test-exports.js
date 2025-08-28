// test-exports.js
import("./dist/index.esm.js")
  .then((module) => {
    console.log("Available exports:", Object.keys(module));
    console.log("Default export:", module.default);
    console.log("QuantumSimulator:", module.QuantumSimulator);
  })
  .catch(console.error);
