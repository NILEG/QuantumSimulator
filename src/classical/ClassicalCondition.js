export class ClassicalCondition {
  constructor(registerName, value, operator = "==") {
    this.registerName = registerName;
    this.value = value;
    this.operator = operator; // '==', '!=', '>', '<', '>=', '<='
  }

  evaluate(registers) {
    const register = registers.get(this.registerName);
    if (!register) {
      throw new Error(`Classical register '${this.registerName}' not found`);
    }

    const registerValue = register.getRegisterValue();

    switch (this.operator) {
      case "==":
        return registerValue === this.value;
      case "!=":
        return registerValue !== this.value;
      case ">":
        return registerValue > this.value;
      case "<":
        return registerValue < this.value;
      case ">=":
        return registerValue >= this.value;
      case "<=":
        return registerValue <= this.value;
      default:
        return false;
    }
  }

  toString() {
    return `${this.registerName} ${this.operator} ${this.value}`;
  }
}
