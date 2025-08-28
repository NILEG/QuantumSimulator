export class ClassicalRegister {
  constructor(name, size) {
    this.name = name;
    this.size = size;
    this.bits = Array(size).fill(0);
  }

  setValue(bitIndex, value) {
    if (bitIndex >= 0 && bitIndex < this.size) {
      this.bits[bitIndex] = value ? 1 : 0;
    }
  }

  getValue(bitIndex) {
    return bitIndex >= 0 && bitIndex < this.size ? this.bits[bitIndex] : 0;
  }

  // Get the integer value of the entire register
  getRegisterValue() {
    let value = 0;
    for (let i = 0; i < this.size; i++) {
      value += this.bits[i] * Math.pow(2, i);
    }
    return value;
  }

  // Set the entire register to a specific integer value
  setRegisterValue(value) {
    const maxValue = Math.pow(2, this.size) - 1;
    const clampedValue = Math.max(0, Math.min(value, maxValue));

    for (let i = 0; i < this.size; i++) {
      this.bits[i] = (clampedValue >> i) & 1;
    }
  }

  toString() {
    return this.bits.slice().reverse().join("");
  }

  clone() {
    const clone = new ClassicalRegister(this.name, this.size);
    clone.bits = [...this.bits];
    return clone;
  }
}
