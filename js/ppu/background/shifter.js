
export class Shifter {
  patternLow = new Uint16Array(1);
  patternHigh = new Uint16Array(1);
  attributeLow = new Uint16Array(1);
  attributeHigh = new Uint16Array(1);

  getPatternLow() {
    return this.patternLow[0];
  }

  setPatternLow(value) {
    this.patternLow[0] = value;
  }

  getPatternHigh() {
    return this.patternHigh[0];
  }

  setPatternHigh(value) {
    this.patternHigh[0] = value;
  }

  getAttributeLow() {
    return this.attributeLow[0];
  }

  setAttributeLow(value) {
    this.attributeLow[0] = value;
  }

  getAttributeHigh() {
    return this.attributeHigh[0];
  }

  setAttributeHigh(value) {
    this.attributeHigh[0] = value;
  }

  shift() {
    this.patternLow[0] <<= 1;
    this.patternHigh[0] <<= 1;
    this.attributeLow[0] <<= 1;
    this.attributeHigh[0] <<= 1;
  }

  reset() {
    this.attributeHigh[0] = 0x0000;
    this.attributeLow[0] = 0x0000;
    this.patternLow[0] = 0x0000;
    this.patternHigh[0] = 0x0000;
  }
}
