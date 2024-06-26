/**
 * The PPU Scroll Register.
 *
 * If the screen does not use split-scrolling, setting the position of the background requires only writing the X and Y
 * coordinates to $2005 and the high bit of both coordinates to $2000.
 *
 * Here are the related registers:
 *    v - Current VRAM address (15 bits)
 *    t - Temporary VRAM address (15 bits); can also be thought of as the address of the top left onscreen tile.
 *    x - Fine X scroll (3 bits)
 *    w - First or second write toggle (1 bit)
 *
 * The PPU uses the current VRAM address for both reading and writing PPU memory thru $2007, and for fetching nametable
 * data to draw the background. As it's drawing the background, it updates the address to point to the nametable data
 * currently being drawn. Bits 10-11 hold the base address of the nametable minus $2000. Bits 12-14 are the Y offset
 * of a scanline within a tile.
 *
 * The 15 bit registers t and v are composed this way during rendering:
 *
 * yyy NN YYYYY XXXXX
 * ||| || ||||| +++++-- coarse X scroll
 * ||| || +++++-------- coarse Y scroll
 * ||| ++-------------- nametable select
 * +++----------------- fine Y scroll
 *
 * Bits 0-4: Coarse X
 * Bits 5-9: Coarse Y
 * Bit 10: Name table X
 * Bit 11: Name table Y
 * Bit 12-14: Fine Y
 * Bit 15: Unused
 */
export class ScrollRegister {
  scroll = new Uint16Array(1);

  getCoarseX() {
    return this.scroll[0] & 0x001F;
  }

  setCoarseX(value) {
    (value & 0x1) === 0 ? this.scroll[0] &= ~(1 << 0) : this.scroll[0] |= (1 << 0);
    (value & 0x2) === 0 ? this.scroll[0] &= ~(1 << 1) : this.scroll[0] |= (1 << 1);
    (value & 0x4) === 0 ? this.scroll[0] &= ~(1 << 2) : this.scroll[0] |= (1 << 2);
    (value & 0x8) === 0 ? this.scroll[0] &= ~(1 << 3) : this.scroll[0] |= (1 << 3);
    (value & 0x10) === 0 ? this.scroll[0] &= ~(1 << 4) : this.scroll[0] |= (1 << 4);
  }

  getCoarseY() {
    return (this.scroll[0] & 0x03E0) >> 5;
  }

  setCoarseY(value) {
    (value & 0x1) === 0 ? this.scroll[0] &= ~(1 << 5) : this.scroll[0] |= (1 << 5);
    (value & 0x2) === 0 ? this.scroll[0] &= ~(1 << 6) : this.scroll[0] |= (1 << 6);
    (value & 0x4) === 0 ? this.scroll[0] &= ~(1 << 7) : this.scroll[0] |= (1 << 7);
    (value & 0x8) === 0 ? this.scroll[0] &= ~(1 << 8) : this.scroll[0] |= (1 << 8);
    (value & 0x10) === 0 ? this.scroll[0] &= ~(1 << 9) : this.scroll[0] |= (1 << 9);
  }

  getNameTableX() {
    return (this.scroll[0] & 0x0400) >> 10;
  }

  setNameTableX(value) {
    value === 0 ? this.scroll[0] &= ~(1 << 10) : this.scroll[0] |= (1 << 10);
  }

  getNameTableY() {
    return (this.scroll[0] & 0x0800) >> 11;
  }

  setNameTableY(value) {
    value === 0 ? this.scroll[0] &= ~(1 << 11) : this.scroll[0] |= (1 << 11);
  }

  getFineY() {
    return (this.scroll[0] & 0x7000) >> 12;
  }

  setFineY(value) {
    (value & 0x1) === 0 ? this.scroll[0] &= ~(1 << 12) : this.scroll[0] |= (1 << 12);
    (value & 0x2) === 0 ? this.scroll[0] &= ~(1 << 13) : this.scroll[0] |= (1 << 13);
    (value & 0x4) === 0 ? this.scroll[0] &= ~(1 << 14) : this.scroll[0] |= (1 << 14);
  }

  getRegister() {
    return this.scroll[0];
  }

  setRegister(data) {
    this.scroll[0] = data;
  }

  reset() {
    this.scroll[0] = 0x0000;
  }
}
