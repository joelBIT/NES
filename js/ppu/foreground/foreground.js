import { Shifter } from "./shifter.js";

/**
 * The foreground consists of sprites. The NES supports 64 8x8 pixel sprites or 64 8x16 pixel sprites.
 */
export class Foreground {
  shifter = new Shifter();
  spriteDataLow = new Uint8Array(1);        // Stores data for a sprite
  spriteDataHigh = new Uint8Array(1);       // Stores data for a sprite
  spriteAddressLow = new Uint16Array(1);    // Location in character memory where to read sprite patterns from
  spriteAddressHigh = new Uint16Array(1);   // Location in character memory where to read sprite patterns from
  spriteZeroHitPossible = false;
  spriteZeroBeingRendered = false;

  setPatternLow(index, data) {
    this.shifter.setPatternLow(index, data);
  }

  setPatternHigh(index, data) {
    this.shifter.setPatternHigh(index, data);
  }

  getPixel(index) {
    return this.shifter.getPixel(index);
  }

  shift(index) {
    this.shifter.shift(index);
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

  setSpriteZeroHitPossible(value) {
    this.spriteZeroHitPossible = value;
  }

  isSpriteZeroHitPossible() {
    return this.spriteZeroHitPossible;
  }

  setSpriteZeroBeingRendered(value) {
    this.spriteZeroBeingRendered = value;
  }

  isSpriteZeroBeingRendered () {
    return this.spriteZeroBeingRendered;
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
    this.shifter.reset();
    this.clearSpriteData();
  }

  clearShifters() {
    this.shifter.reset();
  }

  clearSpriteData() {
    this.spriteDataLow[0] = 0x00;
    this.spriteDataHigh[0] = 0x00;
    this.spriteAddressLow[0] = 0x0000;
    this.spriteAddressHigh[0] = 0x0000;
  }
}
