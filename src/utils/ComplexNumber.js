class ComplexNumber {
  constructor(real, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  static fromMathJS(complexNum) {
    return new ComplexNumber(re(complexNum), im(complexNum));
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  phase() {
    return Math.atan2(this.imag, this.real);
  }

  toString() {
    if (Math.abs(this.imag) < 1e-10) return `${this.real.toFixed(4)}`;
    if (Math.abs(this.real) < 1e-10) return `${this.imag.toFixed(4)}i`;
    const sign = this.imag >= 0 ? "+" : "";
    return `${this.real.toFixed(4)}${sign}${this.imag.toFixed(4)}i`;
  }
}
