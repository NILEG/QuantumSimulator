# Quantum Simulator SDK Documentation

## Table of Contents

- [Introduction](#introduction)
- [QuantumSimulator](#quantumsimulator)
- [SimulatorConfiguration](#simulatorconfiguration)
- [QuantumCircuit](#quantumcircuit)
- [ClassicalRegister](#classicalregister)
- [Conditional Operations](#conditional-operations)
- [Circuit Execution](#circuit-execution)
- [Examples](#examples)

## Introduction

The Quantum Simulation SDK provides a comprehensive set of tools for simulating quantum circuits with classical conditional logic. It supports all major quantum gates, measurements, and complex conditional operations based on classical register states.

## QuantumSimulator

The main simulator class that manages quantum circuits and configurations.

### Basic Usage

```javascript
import { QuantumSimulator } from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
console.log("Quantum simulator initialized:", simulator);
```

### Methods

#### configure()

Returns a SimulatorConfiguration object for setting simulation parameters.

```javascript
import { QuantumSimulator } from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();
console.log("Configuration:", simulator.configure());
```

There are two ways to set configuration:

**Method 1: Using the object returned by configure()**

```javascript
const configs = simulator.configure();
configs.measurementDeferred = true;
console.log("Quantum simulator initialized:", simulator);
```

**Method 2: Using the SimulatorConfiguration() class**

```javascript
import { QuantumSimulator, SimulatorConfiguration } from "quanta_sim";

// Initialize the quantum simulator
const simulator = new QuantumSimulator();

const customConfig = new SimulatorConfiguration();
customConfig.setMeasurementDeferred(true);
customConfig.setEqualProbabilityCollapse("1");

simulator.setConfiguration(customConfig);
console.log("Simulator Configuration: ", simulator.configure());
```

#### Circuit Management Methods

##### createCircuit(name, numQubits, classicalRegisters)

Creates a new quantum circuit.

```javascript
// Create circuit with 3 qubits and default classical register
const circuit1 = simulator.createCircuit("myCircuit", 3, 3);

// Create circuit with named classical registers
const circuit2 = simulator.createCircuit("advanced", 4, {
  result: 4,
  status: 2,
});
```

##### getCircuit(name)

Retrieves an existing circuit by name.

```javascript
const existingCircuit = simulator.getCircuit("myCircuit");
```

##### removeCircuit(name)

Removes a circuit from the simulator.

```javascript
simulator.removeCircuit("myCircuit");
```

##### listCircuits()

Returns an array of all circuit names.

```javascript
const circuitNames = simulator.listCircuits();
console.log("Available circuits:", circuitNames);
```

##### setCurrentCircuit(name) / getCurrentCircuit()

Sets or gets the current active circuit.

```javascript
simulator.setCurrentCircuit("myCircuit");
const current = simulator.getCurrentCircuit();
```

## SimulatorConfiguration

The SimulatorConfiguration class controls the behavior of quantum measurements and state collapse in the quantum simulator. It provides fine-grained control over how quantum measurements are handled and how probabilistic outcomes are resolved.

### Constructor

```javascript
new SimulatorConfiguration();
```

Creates a new configuration object with default settings:

- `measurementDeferred`: false
- `equalProbabilityCollapse`: "random"

### Properties

#### measurementDeferred

- **Type**: boolean
- **Default**: false
- **Description**: Controls whether quantum measurements immediately collapse the quantum state or are deferred until circuit execution completes.

#### equalProbabilityCollapse

- **Type**: string
- **Valid Values**: "random", "0", "1"
- **Default**: "random"
- **Description**: Determines how to resolve measurement outcomes when quantum states have equal probabilities.

### Configuration Methods

#### setMeasurementDeferred(deferred)

```javascript
config.setMeasurementDeferred(true);
```

**Parameters:**

- `deferred` (boolean): Whether to defer quantum state collapse

**Returns:** The configuration instance (for method chaining)

**Description:** Controls when quantum state collapse occurs during measurements.

##### When measurementDeferred = false (Default Behavior)

- Quantum measurements immediately collapse the state vector
- Subsequent quantum operations operate on the collapsed state
- Provides classical-like deterministic behavior after measurement
- Suitable for circuits where measurement outcomes affect later gates

##### When measurementDeferred = true (Deferred Measurement)

- Quantum state vector remains in superposition throughout circuit execution
- Measurement probabilities are calculated, but state collapse is delayed
- Final measurement results are sampled from the complete probability distribution
- Enables quantum parallelism to continue after "measurements"
- Useful for quantum algorithms where intermediate measurements are used for classical control

**Example:**

```javascript
import { QuantumSimulator, SimulatorConfiguration } from "quanta_sim";

// Initialize the quantum simulator with Deferred measurement
const simulator = new QuantumSimulator();
const customConfig = new SimulatorConfiguration();
customConfig.setMeasurementDeferred(true);
simulator.setConfiguration(customConfig);

const circuit = simulator.createCircuit("test", 1, { c: 2 });
circuit.h(0);
circuit.measure(0, "c", 0); // State remains in superposition

const result = circuit.executeDeterministic();
console.log("Measurement Result: ", result);
```

**Output:**

```javascript
finalProbabilities: [
  {
    state: "|0⟩",
    amplitude: [ComplexNumber],
    probability: 0.4999999999999999,
  },
  {
    state: "|1⟩",
    amplitude: [ComplexNumber],
    probability: 0.4999999999999999,
  },
];
```

#### setEqualProbabilityCollapse(strategy)

```javascript
config.setEqualProbabilityCollapse("0");
```

**Parameters:**

- `strategy` (string): Strategy for resolving equal probability measurements
  - "random": Use random selection (default)
  - "0": Always collapse to |0⟩ state
  - "1": Always collapse to |1⟩ state

**Returns:** The configuration instance (for method chaining)

**Throws:** Error if strategy is not one of the valid values

##### Strategy Options

###### "random" (Default)

- Uses JavaScript's Math.random() for probabilistic selection
- Provides truly random measurement outcomes
- Each execution may produce different results
- Most physically realistic behavior
- Suitable for Monte Carlo simulations and statistical analysis

###### "0" (Deterministic Zero)

- Always collapses equal probability states to |0⟩
- Provides deterministic, reproducible results
- Useful for testing and debugging quantum circuits
- Enables predictable behavior in educational contexts
- May not reflect real quantum device behavior

###### "1" (Deterministic One)

- Always collapses equal probability states to |1⟩
- Provides deterministic, reproducible results
- Useful for testing edge cases and boundary conditions
- Complements the "0" strategy for comprehensive testing

**Example:**

```javascript
import { QuantumSimulator, SimulatorConfiguration } from "quanta_sim";

const simulator = new QuantumSimulator();
const customConfig = new SimulatorConfiguration();
customConfig.setMeasurementDeferred(false);
customConfig.setEqualProbabilityCollapse("0");
simulator.setConfiguration(customConfig);

const circuit = simulator.createCircuit("test", 1, { c: 2 });
circuit.h(0);
circuit.measure(0, "c", 0);
circuit.ifEqual("c", 0).then((c, condition) => {
  c.x(0, condition); // if (c == 0) x q[0]
});

const result = circuit.executeDeterministic();
console.log("Measurement Result: ", result);
```

#### clone()

```javascript
const newConfig = config.clone();
```

**Returns:** A deep copy of the configuration object

**Description:** Creates an independent copy of the configuration. Changes to the cloned configuration do not affect the original.

### Usage Patterns

#### Method Chaining

The configuration methods support fluent method chaining:

```javascript
const config = new SimulatorConfiguration()
  .setMeasurementDeferred(true)
  .setEqualProbabilityCollapse("0");
```

#### Circuit Integration

Configurations are applied when creating quantum circuits:

```javascript
const simulator = new QuantumSimulator();
const config = simulator.configure().setMeasurementDeferred(true);

const circuit = simulator.createCircuit("test", 3, { c: 3 });
// Circuit inherits the simulator's configuration
```

#### Per-Circuit Configuration

Each circuit receives a cloned copy of the configuration, allowing independent behavior:

```javascript
import {
  QuantumSimulator,
  SimulatorConfiguration,
  QuantumCircuit,
} from "quanta_sim";

const simulator = new QuantumSimulator();

const config1 = new SimulatorConfiguration().setMeasurementDeferred(true);
const config2 = new SimulatorConfiguration().setMeasurementDeferred(false);

const circuit1 = new QuantumCircuit(2, { c: 2 }, config1);
const circuit2 = new QuantumCircuit(2, { c: 2 }, config2);

simulator.setCircuit(circuit1, "circuit1");
```

## QuantumCircuit

Represents a quantum circuit with qubits and classical registers.

### Constructor

```javascript
// Basic circuit
const circuit = new QuantumCircuit(numQubits, classicalRegisters, config);

// Example
const circuit = new QuantumCircuit(3, { c: 3, aux: 1 });
```

### Classical Register Management

#### addClassicalRegister(name, size)

Adds a new classical register.

```javascript
circuit.addClassicalRegister("results", 4);
circuit.addClassicalRegister("flags", 2);
```

#### getClassicalRegister(name)

Retrieves a classical register object.

```javascript
const register = circuit.getClassicalRegister("results");
console.log("Register value:", register.getRegisterValue());
```

#### getClassicalValue(registerName)

Gets the integer value of a classical register.

```javascript
const value = circuit.getClassicalValue("results"); // Returns integer
```

**Example:**

```javascript
import {
  QuantumSimulator,
  SimulatorConfiguration,
  QuantumCircuit,
} from "quanta_sim";

const simulator = new QuantumSimulator();
const circuit = new QuantumCircuit(3, { c: 3, aux: 1 });
simulator.setCircuit(circuit, "Test Circuit");

circuit.addClassicalRegister("results", 4);
circuit.addClassicalRegister("flags", 2);
circuit.x(0);
circuit.measure(0, "results", 3);
circuit.measure(0, "flags", 0);

const register = circuit.getClassicalRegister("results");
console.log("Register value:", register.getRegisterValue()); // Returns 8

const value = circuit.getClassicalValue("results");
console.log("Classical value:", value); // Returns 8

const flagsRegister = circuit.getClassicalRegister("flags");
console.log("Flags Register value:", flagsRegister.getRegisterValue()); // Returns 0
```

### Single Qubit Gates

#### Basic Pauli Gates

```javascript
// Pauli-X (NOT gate)
circuit.x(0);

// Pauli-Y
circuit.y(1);

// Pauli-Z
circuit.z(2);

// Identity (no-op)
circuit.i(0); // Available via applyGate("I", 0)
```

#### Hadamard Gate

```javascript
// Create superposition
circuit.h(0); // |0⟩ → (|0⟩ + |1⟩)/√2
```

#### Phase Gates

```javascript
// S gate (quarter turn)
circuit.s(0);

// S dagger
circuit.sdg(0);

// T gate (eighth turn)
circuit.t(0);

// T dagger
circuit.tdg(0);

// Square root of X
circuit.sx(0);
circuit.sxdg(0);
```

#### Parametric Single Qubit Gates

```javascript
// General unitary gate U(θ, φ, λ)
circuit.u(Math.PI / 2, 0, Math.PI, 0);

// Simplified U gates
circuit.u1(Math.PI / 4, 0); // U1(λ) = U(0, 0, λ)
circuit.u2(0, Math.PI, 0); // U2(φ, λ) = U(π/2, φ, λ)
circuit.u3(Math.PI, 0, Math.PI, 0); // U3(θ, φ, λ) = U(θ, φ, λ)

// Rotation gates
circuit.rx(Math.PI / 4, 0); // Rotation around X-axis
circuit.ry(Math.PI / 3, 1); // Rotation around Y-axis
circuit.rz(Math.PI / 6, 2); // Rotation around Z-axis

// Phase gate
circuit.p(Math.PI / 8, 0); // Add phase λ to |1⟩ state
```

### Two Qubit Gates

#### Controlled Gates

```javascript
// Controlled-NOT (CNOT)
circuit.cnot(0, 1); // control=0, target=1
circuit.cx(0, 1); // Alias for cnot

// Controlled Pauli gates
circuit.cz(0, 1); // Controlled-Z
circuit.cy(0, 1); // Controlled-Y

// Controlled Hadamard
circuit.ch(0, 1);

// Controlled phase gates
circuit.cs(0, 1); // Controlled-S
circuit.csdg(0, 1); // Controlled-S†
circuit.ct(0, 1); // Controlled-T
circuit.ctdg(0, 1); // Controlled-T†
circuit.csx(0, 1); // Controlled-√X
circuit.csxdg(0, 1); // Controlled-√X†
```

#### Controlled Parametric Gates

```javascript
// Controlled unitary
circuit.cu(Math.PI / 2, 0, Math.PI, 0, 1); // CU(θ, φ, λ, control, target)

// Controlled U variations
circuit.cu1(Math.PI / 4, 0, 1);
circuit.cu2(0, Math.PI, 0, 1);
circuit.cu3(Math.PI, 0, Math.PI, 0, 1);

// Controlled rotations
circuit.crx(Math.PI / 4, 0, 1);
circuit.cry(Math.PI / 3, 0, 1);
circuit.crz(Math.PI / 6, 0, 1);

// Controlled phase
circuit.cp(Math.PI / 8, 0, 1);
```

#### Two Qubit Parametric Gates

```javascript
// Two-qubit rotation gates
circuit.rxx(Math.PI / 4, 0, 1); // XX rotation
circuit.ryy(Math.PI / 3, 0, 1); // YY rotation
circuit.rzz(Math.PI / 6, 0, 1); // ZZ rotation

// SWAP gate
circuit.swap(0, 1);
```

### Three Qubit Gates

```javascript
// Toffoli gate (CCX, CCNOT)
circuit.ccx(0, 1, 2); // control1=0, control2=1, target=2
circuit.toffoli(0, 1, 2); // Alias

// Relative Toffoli
circuit.rccx(0, 1, 2);

// Fredkin gate (Controlled SWAP)
circuit.fredkin(0, 1, 2); // control=0, target1=1, target2=2
circuit.cswap(0, 1, 2); // Alias
```

### Four Qubit Gates

```javascript
// Four-control Toffoli
circuit.cccx(0, 1, 2, 3); // Three controls, one target
circuit.c3x(0, 1, 2, 3); // Alias
```

### Measurements and Classical Operations

#### Measurement

```javascript
// Measure qubit into default register
circuit.measure(0, "c", 0); // qubit=0, register="c", bit=0

// Measure into specific register
circuit.measure(1, "results", 2);
```

#### Reset

```javascript
// Reset qubit to |0⟩ state
circuit.reset(0);
```

#### Barriers

```javascript
// Add barrier to prevent optimization across it
circuit.barrier([0, 1, 2]); // Barrier across qubits 0, 1, 2
circuit.barrier(0); // Barrier on single qubit
```

**Example:**

```javascript
const simulator = new QuantumSimulator();
const circuit = new QuantumCircuit(3, { c: 3, aux: 1 });
simulator.setCircuit(circuit, "Test Circuit");

circuit.x(0);
circuit.reset(0);
circuit.barrier([0, 1, 2]);

const results = circuit.executeDeterministic();
console.log("Deterministic Results:", results);
console.log(circuit.draw());
```

**Output:**

```
finalProbabilities: [
  { state: '|000⟩', amplitude: [ComplexNumber], probability: 1 },
  { state: '|001⟩', amplitude: [ComplexNumber], probability: 0 },
  // ... other states with probability: 0
],

q[0] |0⟩──[X]──[R]────║─
q[1] |0⟩────────────║─
q[2] |0⟩────────────║─
```

### Circuit Properties

#### getDepth() / getWidth()

Returns circuit depth (operations) and width (qubits).

```javascript
console.log("Circuit depth:", circuit.getDepth());
console.log("Circuit width:", circuit.getWidth());
```

#### getGateCount()

Returns count of each gate type.

```javascript
const gateCounts = circuit.getGateCount();
console.log("Gate usage:", gateCounts);
```

### Visualization and Export

#### draw()

Returns ASCII visualization of the circuit.

```javascript
console.log(circuit.draw());
```

#### toQASM()

Exports circuit as OpenQASM code.

```javascript
const qasm = circuit.toQASM();
console.log(qasm);
```

## ClassicalRegister

Manages classical bits with integer arithmetic operations.

### Constructor

```javascript
const register = new ClassicalRegister("myReg", 4); // name, size
```

### Methods

#### setValue(bitIndex, value) / getValue(bitIndex)

Set/get individual bit values.

```javascript
register.setValue(0, 1); // Set bit 0 to 1
register.setValue(1, 0); // Set bit 1 to 0
const bit = register.getValue(0); // Get bit 0
```

#### setRegisterValue(value) / getRegisterValue()

Set/get the entire register as an integer.

```javascript
register.setRegisterValue(5); // Sets register to binary 0101
const value = register.getRegisterValue(); // Returns 5
```

#### toString()

Returns the binary representation as a string.

```javascript
const binaryStr = register.toString(); // Returns "0101"
```

#### clone()

Creates a copy of the register.

```javascript
const copy = register.clone();
```

**Example:**

```javascript
const register = new ClassicalRegister("myReg", 4);

register.setValue(0, 1);
register.setValue(1, 0);
const bit = register.getValue(0);
console.log(`Bit 0: ${bit}`); // Outputs: Bit 0: 1

console.log(`Register Value: ${register.getRegisterValue()}`); // Outputs: Register Value: 1

register.setRegisterValue(5);
const value = register.getRegisterValue();
console.log(`Register Value: ${value}`); // Outputs: Register Value: 5

const binaryStr = register.toString();
console.log(`Register Value (Binary): ${binaryStr}`); // Outputs: Register Value (Binary): 0101
```

## Conditional Operations

The ClassicalCondition class enables conditional execution of quantum operations based on the values stored in classical registers. This allows for classical control flow within quantum circuits, enabling sophisticated quantum algorithms that rely on measurement outcomes to determine subsequent operations.

### ClassicalCondition Class

#### Constructor

```javascript
new ClassicalCondition(registerName, value, (operator = "=="));
```

**Parameters:**

- `registerName` (string): Name of the classical register to evaluate
- `value` (number): The comparison value
- `operator` (string, optional): Comparison operator. Default: "=="

**Supported Operators:**

- "==": Equal to
- "!=": Not equal to (IBM Composer doesn't support this operator currently)
- ">": Greater than (IBM Composer doesn't support this operator currently)
- "<": Less than (IBM Composer doesn't support this operator currently)
- ">=": Greater than or equal to (IBM Composer doesn't support this operator currently)
- "<=": Less than or equal to (IBM Composer doesn't support this operator currently)

#### toString()

Returns a string representation of the condition.

```javascript
console.log(condition.toString()); // "results == 5"
```

### Basic Conditional Gates

```javascript
// Create a condition object
const condition = new ClassicalCondition("results", 5, "==");

// Apply gate with condition
circuit.x(0, condition);

// Or use circuit's conditional methods
circuit.ifEqual("results", 5).then((c, condition) => {
  c.x(0, condition);
  c.h(1, condition);
});

circuit.ifNotEqual("status", 0).then((c, condition) => {
  c.cnot(0, 1, condition);
});

circuit.ifGreater("counter", 3).then((c, condition) => {
  c.z(2, condition);
});
```

### Conditional Examples

```javascript
// Complex conditional logic
const circuit = simulator.createCircuit("conditional", 3, {
  c: 3,
  status: 2,
});

// Set up initial state
circuit.h(0);
circuit.cnot(0, 1);
circuit.measure(0, "c", 0);
circuit.measure(1, "c", 1);

// Apply conditional gates
circuit.ifEqual("c", 3).then((c, condition) => {
  // If classical register c equals 3 (binary 11)
  c.x(2, condition);
});

circuit.ifNotEqual("c", 0).then((c, condition) => {
  // If classical register c is not zero
  c.h(2, condition);
});
```

## Circuit Execution

### executeDeterministic()

Executes the circuit and returns detailed execution information.

```javascript
const result = circuit.executeDeterministic();
console.log("Final probabilities:", result.finalProbabilities);
console.log("Classical registers:", result.classicalRegisters);
console.log("Operation history:", result.operationHistory);
```

### simulate(shots)

Simulates the circuit multiple times and returns measurement statistics.

```javascript
const results = circuit.simulate(1024);
console.log("Measurement counts:", results);
// Output: { "00": 512, "11": 512 } for a Bell state
```

### simulateWeighted(shots)

Alternative simulation using weighted random sampling.

```javascript
const results = circuit.simulateWeighted(1024);
```

## Examples

### Basic Bell State Circuit

```javascript
import { QuantumSimulator } from "quanta_sim";

const simulator = new QuantumSimulator();
const circuit = simulator.createCircuit("bell_state", 2, { c: 2 });

// Create Bell state
circuit.h(0);
circuit.cnot(0, 1);

// Measure both qubits
circuit.measure(0, "c", 0);
circuit.measure(1, "c", 1);

const result = circuit.executeDeterministic();
console.log("Bell state result:", result);
```

### Conditional Quantum Circuit

```javascript
import { QuantumSimulator, SimulatorConfiguration } from "quanta_sim";

const simulator = new QuantumSimulator();
const config = new SimulatorConfiguration()
  .setMeasurementDeferred(false)
  .setEqualProbabilityCollapse("0");

simulator.setConfiguration(config);

const circuit = simulator.createCircuit("conditional_test", 2, { c: 2 });

circuit.h(0);
circuit.measure(0, "c", 0);

// Apply X gate conditionally
circuit.ifEqual("c", 0).then((c, condition) => {
  c.x(1, condition);
});

const result = circuit.executeDeterministic();
console.log("Conditional circuit result:", result);
```

### Multi-Register Circuit

```javascript
const circuit = simulator.createCircuit("multi_reg", 4, {
  results: 4,
  flags: 2,
});

circuit.addClassicalRegister("aux", 1);

// Create superposition
circuit.h(0);
circuit.h(1);

// Entangle qubits
circuit.cnot(0, 2);
circuit.cnot(1, 3);

// Measure into different registers
circuit.measure(0, "results", 0);
circuit.measure(1, "results", 1);
circuit.measure(2, "flags", 0);
circuit.measure(3, "aux", 0);

const result = circuit.executeDeterministic();
console.log("Multi-register result:", result);
```

This documentation provides comprehensive coverage of the Quantum Simulator SDK, including all classes, methods, configuration options, and practical examples for building quantum circuits with classical control logic.
