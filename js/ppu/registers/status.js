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

  setSpriteOverflow() {
    this.status[0] |= (1 << 5);
  }

  clearSpriteOverflow() {
    this.status[0] &= ~(1 << 5);
  }

  setSpriteZeroHit() {
    this.status[0] |= (1 << 6);
  }

  clearSpriteZeroHit() {
    this.status[0] &= ~(1 << 6);
  }

  setVerticalBlank() {
    this.status[0] |= (1 << 7);
  }

  clearVerticalBlank() {
    this.status[0] &= ~(1 << 7);
  }

  getRegister() {
    return this.status[0];
  }

  setRegister(data) {
    this.status[0] = data;
  }
}
