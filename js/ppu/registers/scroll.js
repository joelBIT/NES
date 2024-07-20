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

  /**
   * To facilitate scrolling the NES stores two Nametables that lies next to each other. As the viewable area of the screen scrolls across
   * it crosses this boundary and we render from two different nametables simultaneously. The CPU is tasked with updating the invisible
   * parts of the nametable with the bits of level that are going to be seen next. When the viewable window scrolls past the end of
   * the second nametable, it is wrapped back around into the first one, and this allows you to have a continuous scrolling motion
   * in two directions.
   */
  incrementScrollX() {
    if (this.getCoarseX() === 31) {
      this.setCoarseX(0);
      this.setNameTableX(this.getNameTableX() > 0 ? 0 : 1);     // Flip a bit
    } else {
      this.setCoarseX(this.getCoarseX() + 1);
    }
  }

  incrementScrollY() {
    if (this.getFineY() < 7) {
      this.setFineY(this.getFineY() + 1);
    } else {
      this.setFineY(0);
      if (this.getCoarseY() === 29) {
        this.setCoarseY(0);
        this.setNameTableY(this.getNameTableY() > 0 ? 0 : 1);   // Flip a bit
      } else if (this.getCoarseY() === 31) {
        this.setCoarseY(0);
      } else {
        this.setCoarseY(this.getCoarseY() + 1);
      }
    }
  }

  /**
   * Each nametable has two rows of cells that are not tile information, instead they represent the attribute information
   * that indicates which palettes are applied to which area on the screen. This method reconstructs the 12-bit address
   * that is used to offset into the attribute memory to retrieve the desired attribute information.
   *
   * @returns {number}    the offset into the attribute memory
   */
  getAttributeMemoryOffset() {
    return (this.getNameTableY() << 11)
      | (this.getNameTableX() << 10)
      | ((this.getCoarseY() >> 2) << 3)
      | (this.getCoarseX() >> 2);
  }

  /**
   * Extracts the palette bits from the attribute byte.
   *
   * @param attributeByte         the attribute byte from the attribute memory
   * @returns {*}                 the palette bits from the attribute byte
   */
  getPaletteBits(attributeByte) {
    if (this.getCoarseY() & 0x02) {
      attributeByte >>= 4;
    }
    if (this.getCoarseX() & 0x02) {
      attributeByte >>= 2;
    }
    attributeByte &= 0x03;
    return attributeByte;
  }

  /**
   * Transfer the Y address from another Scroll Register to this Register.
   *
   * @param scrollRegister    the Scroll Register containing the Y address
   */
  transferAddressY(scrollRegister) {
    this.setFineY(scrollRegister.getFineY());
    this.setNameTableY(scrollRegister.getNameTableY());
    this.setCoarseY(scrollRegister.getCoarseY());
  }

  /**
   * Transfer the X address from another Scroll Register to this Register.
   *
   * @param scrollRegister    the Scroll Register containing the X address
   */
  transferAddressX(scrollRegister) {
    this.setNameTableX(scrollRegister.getNameTableX());
    this.setCoarseX(scrollRegister.getCoarseX());
  }

  reset() {
    this.scroll[0] = 0x0000;
  }
}
