/**
 * A shifter is preloaded by the end of the current scanline with the data for the start of the next scanline.
 */
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

  getPixel(bitMux) {
    const pixelPlane0 = (this.patternLow[0] & bitMux) > 0 ? 1 : 0;
    const pixelPlane1 = (this.patternHigh[0] & bitMux) > 0 ? 1 : 0;
    return (pixelPlane1 << 1) | pixelPlane0;         // Combine to form pixel index
  }

  getPalette(bitMux) {
    const pal0 = (this.attributeLow[0] & bitMux) > 0 ? 1 : 0;
    const pal1 = (this.attributeHigh[0] & bitMux) > 0 ? 1 : 0;
    return (pal1 << 1) | pal0;
  }

  /**
   * Shifting background tile pattern row and palette attributes by 1.
   */
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
