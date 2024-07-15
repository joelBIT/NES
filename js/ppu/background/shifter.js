/**
 * A shifter is preloaded by the end of the current scanline with the data for the start of the next scanline.
 * This shifter takes the buffered tile's information and composites it to the correct pixel color in the correct
 * location. If we have a row of 16 pixels on a single scanline, that makes a row of 2 tiles of 8 pixels each. While
 * the scanline is rendering the first 8 pixels (row of current tile), it is loading up the information for the next 8
 * pixels (the row of the next tile). This information is loaded into the low byte of this 16-bit shifter. When the
 * current tile's boundary is reached, the bit information for the next 8 pixels (next tile) is in the high byte of
 * this 16-bit shifter.
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

  /**
   *
   * @param location  corresponds to which bit in the register we are interested in.
   * @returns {number}  a 2-bit word that represents the pixel
   */
  getPixel(location) {
    const pixelPlane0 = (this.patternLow[0] & location) > 0 ? 1 : 0;
    const pixelPlane1 = (this.patternHigh[0] & location) > 0 ? 1 : 0;
    return (pixelPlane1 << 1) | pixelPlane0;
  }

  /**
   *
   * @param location  corresponds to which bit in the register we are interested in.
   * @returns {number}  a 2-bit word that represents the palette
   */
  getPalette(location) {
    const pal0 = (this.attributeLow[0] & location) > 0 ? 1 : 0;
    const pal1 = (this.attributeHigh[0] & location) > 0 ? 1 : 0;
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
