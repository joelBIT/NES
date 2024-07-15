/**
 * The foreground consists of sprites. The NES supports 64 8x8 pixel sprites or 64 8x16 pixel sprites.
 */
export class Foreground {
  patternLow = new Uint8Array(8);      // Low-bit plane of the sprite
  patternHigh = new Uint8Array(8);      // High-bit plane of the sprite

  setPatternLow(index, data) {
    this.patternLow[index] = data;
  }

  setPatternHigh(index, data) {
    this.patternHigh[index] = data;
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

  reset() {
    for (let i = 0; i < 8; i++) {
      this.patternHigh[i] = 0;
      this.patternLow[i] = 0;
    }
  }
}
