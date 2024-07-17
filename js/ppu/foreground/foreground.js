/**
 * The foreground consists of sprites. The NES supports 64 8x8 pixel sprites or 64 8x16 pixel sprites.
 */
export class Foreground {
  patternLow = new Uint8Array(8);           // Low-bit plane of the sprite
  patternHigh = new Uint8Array(8);          // High-bit plane of the sprite
  spriteDataLow = new Uint8Array(1);        // Stores data for a sprite
  spriteDataHigh = new Uint8Array(1);       // Stores data for a sprite
  spriteAddressLow = new Uint16Array(1);    // Location in character memory where to read sprite patterns from
  spriteAddressHigh = new Uint16Array(1);   // Location in character memory where to read sprite patterns from

  setPatternLow(index, data) {
    this.patternLow[index] = data;
  }

  setPatternHigh(index, data) {
    this.patternHigh[index] = data;
  }

  getSpriteAddressLow() {
    return this.spriteAddressLow[0];
  }

  setSpriteAddressLow(address) {
    this.spriteAddressLow[0] = address;
  }

  getSpriteAddressHigh() {
    return this.spriteAddressHigh[0];
  }

  setSpriteAddressHigh(address) {
    this.spriteAddressHigh[0] = address;
  }

  getSpriteDataLow() {
    return this.spriteDataLow[0];
  }

  setSpriteDataLow(data) {
    this.spriteDataLow[0] = data;
  }

  getSpriteDataHigh() {
    return this.spriteDataHigh[0];
  }

  setSpriteDataHigh(data) {
    this.spriteDataHigh[0] = data;
  }

  shift(i) {
    this.patternLow[i] <<= 1;
    this.patternHigh[i] <<= 1;
  }

  /**
   * Retrieve a 2-bit pixel.
   *
   * @param index - the index of the high bit and low bit of the pixel.
   * @returns {number}  a 2-bit pixel
   */
  getPixel(index) {
    let pixelLow = (this.patternLow[index] & 0x80) > 0 ? 1 : 0;
    let pixelHigh = (this.patternHigh[index] & 0x80) > 0 ? 1 : 0;
    return (pixelHigh << 1) | pixelLow;
  }

  /**
   *  Reverses the bits of an 8-bit value.
   */
  reverseBits(value) {
    value = (value & 0xF0) >> 4 | (value & 0x0F) << 4;
    value = (value & 0xCC) >> 2 | (value & 0x33) << 2;
    value = (value & 0xAA) >> 1 | (value & 0x55) << 1;

    return value;
  }

  /**
   * Flip Patterns Horizontally.
   */
  flipSpriteDataBits() {
    this.spriteDataHigh[0] = this.reverseBits(this.spriteDataHigh[0]);
    this.spriteDataLow[0] = this.reverseBits(this.spriteDataLow[0]);
  }

  reset() {
    for (let i = 0; i < 8; i++) {
      this.patternHigh[i] = 0;
      this.patternLow[i] = 0;
    }

    this.clearSpriteData();
  }

  clearSpriteData() {
    this.spriteDataLow[0] = 0x00;
    this.spriteDataHigh[0] = 0x00;
    this.spriteAddressLow[0] = 0x0000;
    this.spriteAddressHigh[0] = 0x0000;
  }
}
