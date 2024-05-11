/**
 * The PPU status register. The first five bits are unused. This register informs about the rendering process.
 *
 * Bit 0-4: PPU open bus (unused).
 * Bit 5: Sprite overflow: This flag is set during sprite evaluation.
 * Bit 6: Sprite 0 hit: Set when a nonzero pixel of sprite 0 overlaps a nonzero background pixel. Used for raster timing.
 * Bit 7: Vertical blank has started (0: not in vblank; 1: in vblank).
 *
 */
export class StatusRegister {
  status = new Uint8Array(1);

  setSpriteOverflow(value) {
    value === 0 ? this.status[0] &= ~(1 << 5) : this.status[0] |= (1 << 5);
  }

  setSpriteZeroHit(value) {
    value === 0 ? this.status[0] &= ~(1 << 6) : this.status[0] |= (1 << 6);
  }

  setVerticalBlank(value) {
    value === 0 ? this.status[0] &= ~(1 << 7) : this.status[0] |= (1 << 7);
  }

  getRegister() {
    return this.status[0];
  }

  setRegister(data) {
    this.status[0] = data;
  }
}

/**
 * The PPU control register.
 *
 * Bit 0: Name table X
 * Bit 1: Name table Y
 * Bit 2: Increment mode. VRAM address increment per CPU read/write of PPUDATA (0: add 1, going across; 1: add 32, going down).
 * Bit 3: Sprite pattern table address for 8x8 sprites.
 * Bit 4: Background pattern table address (0: $0000; 1: $1000).
 * Bit 5: Sprite size (0: 8x8 pixels; 1: 8x16 pixels).
 * Bit 6: Slave mode (unused).
 * Bit 7: Enable NMI. Generate an NMI at the start of the vertical blanking interval (0: off; 1: on).
 *
 */
export class ControlRegister {
  control = new Uint8Array(1);

  getNameTableX() {
    return (this.control[0] & 0x01);
  }

  getNameTableY() {
    return (this.control[0] & 0x02) >> 1;
  }

  getIncrementMode() {
    return (this.control[0] & 0x04) >> 2;
  }

  getPatternSprite() {
    return (this.control[0] & 0x08) >> 3;
  }

  getPatternBackground() {
    return (this.control[0] & 0x10) >> 4;
  }

  getSpriteSize() {
    return (this.control[0] & 0x20) >> 5;
  }

  getEnableNMI() {
    return (this.control[0] & 0x80) >> 7;
  }

  setRegister(data) {
    this.control[0] = data;
  }
}

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

/**
 * The Loopy Register used by the PPU.
 *
 * Bits 0-4: Coarse X
 * Bits 5-9: Coarse Y
 * Bit 10: Name table X
 * Bit 11: Name table Y
 * Bit 12-14: Fine Y
 * Bit 15: Unused
 */
export class LoopyRegister {
  loopy = new Uint16Array(1);

  getCoarseX() {
    return this.loopy[0] & 0x001F;
  }

  setCoarseX(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 0) : this.loopy[0] |= (1 << 0);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 1) : this.loopy[0] |= (1 << 1);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 2) : this.loopy[0] |= (1 << 2);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 3) : this.loopy[0] |= (1 << 3);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 4) : this.loopy[0] |= (1 << 4);
  }

  getCoarseY() {
    return (this.loopy[0] & 0x03E0) >> 5;
  }

  setCoarseY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 5) : this.loopy[0] |= (1 << 5);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 6) : this.loopy[0] |= (1 << 6);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 7) : this.loopy[0] |= (1 << 7);
    (value & 0x8) === 0 ? this.loopy[0] &= ~(1 << 8) : this.loopy[0] |= (1 << 8);
    (value & 0x10) === 0 ? this.loopy[0] &= ~(1 << 9) : this.loopy[0] |= (1 << 9);
  }

  getNameTableX() {
    return (this.loopy[0] & 0x0400) >> 10;
  }

  setNameTableX(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 10) : this.loopy[0] |= (1 << 10);
  }

  getNameTableY() {
    return (this.loopy[0] & 0x0800) >> 11;
  }

  setNameTableY(value) {
    value === 0 ? this.loopy[0] &= ~(1 << 11) : this.loopy[0] |= (1 << 11);
  }

  getFineY() {
    return (this.loopy[0] & 0x7000) >> 12;
  }

  setFineY(value) {
    (value & 0x1) === 0 ? this.loopy[0] &= ~(1 << 12) : this.loopy[0] |= (1 << 12);
    (value & 0x2) === 0 ? this.loopy[0] &= ~(1 << 13) : this.loopy[0] |= (1 << 13);
    (value & 0x4) === 0 ? this.loopy[0] &= ~(1 << 14) : this.loopy[0] |= (1 << 14);
  }

  getRegister() {
    return this.loopy[0];
  }

  setRegister(data) {
    this.loopy[0] = data;
  }
}
