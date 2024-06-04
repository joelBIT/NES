/**
 * The PPU Mask Register. This register controls the rendering of sprites and backgrounds, as well as colour effects.
 *
 * 7  bit  0
 * ---- ----
 * BGRs bMmG
 * |||| ||||
 * |||| |||+- Greyscale (0: normal color, 1: produce a greyscale display)
 * |||| ||+-- 1: Show background in leftmost 8 pixels of screen, 0: Hide
 * |||| |+--- 1: Show sprites in leftmost 8 pixels of screen, 0: Hide
 * |||| +---- 1: Show background
 * |||+------ 1: Show sprites
 * ||+------- Emphasize red (green on PAL/Dendy)
 * |+-------- Emphasize green (red on PAL/Dendy)
 * +--------- Emphasize blue
 *
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

  reset() {
    this.mask[0] = 0x00;
  }
}
