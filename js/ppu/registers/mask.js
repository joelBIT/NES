/**
 * The PPU mask register. This register is really just a series of switches that determine which parts of
 * the PPU are switched on or off.
 *
 * Bit 0: Greyscale (0: normal color, 1: produce a greyscale display).
 * Bit 1: Value 1: Show background in leftmost 8 pixels of screen, 0: Hide.
 * Bit 2: Value 1: Show sprites in leftmost 8 pixels of screen, 0: Hide.
 * Bit 3: Value 1: Show background.
 * Bit 4: Value 1: Show sprites.
 * Bit 5: Emphasize red (green on PAL/Dendy).
 * Bit 6: Emphasize green (red on PAL/Dendy).
 * Bit 7: Emphasize blue.
 */
export class MaskRegister {
  mask = new Uint8Array(1);

  getGrayScale() {
    return (this.mask[0] & 0x01);
  }

  getRenderBackgroundLeft() {
    return (this.mask[0] & 0x02) >> 1;
  }

  getRenderSpritesLeft() {
    return (this.mask[0] & 0x04) >> 2;
  }

  getRenderBackground() {
    return (this.mask[0] & 0x08) >> 3;
  }

  getRenderSprites() {
    return (this.mask[0] & 0x10) >> 4;
  }

  setRegister(data) {
    this.mask[0] = data;
  }
}
